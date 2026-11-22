#!/bin/bash

###############################################################################
# Script de Deployment Automat pentru FotoIT pe AWS EC2
# 
# Utilizare:
#   ./deploy-aws.sh <EC2_IP> <SSH_USER> <SSH_KEY_PATH>
#
# Exemplu:
#   ./deploy-aws.sh 54.123.45.67 ubuntu ~/.ssh/my-key.pem
###############################################################################

set -e  # Oprește scriptul la prima eroare

# Culori pentru output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verifică argumentele
if [ $# -lt 3 ]; then
    echo -e "${RED}Eroare: Argumente lipsă!${NC}"
    echo "Utilizare: $0 <EC2_IP> <SSH_USER> <SSH_KEY_PATH>"
    echo "Exemplu: $0 54.123.45.67 ubuntu ~/.ssh/my-key.pem"
    exit 1
fi

EC2_IP=$1
SSH_USER=$2
SSH_KEY=$3

# Verifică dacă cheia SSH există
if [ ! -f "$SSH_KEY" ]; then
    echo -e "${RED}Eroare: Fișierul cheii SSH nu există: $SSH_KEY${NC}"
    exit 1
fi

# Setează permisiunile corecte pentru cheia SSH
chmod 400 "$SSH_KEY"

# Verifică fișierele necesare
echo -e "${YELLOW}[0/11] Verificare fișiere necesare...${NC}"
MISSING_FILES=0

# Verifică fișierul de credențiale Google Drive
CREDENTIALS_FILE="backend/src/main/resources/fotoit-gallery-credentials.json"
if [ ! -f "$CREDENTIALS_FILE" ]; then
    echo -e "${RED}⚠️  ATENȚIE: Fișierul de credențiale Google Drive nu a fost găsit!${NC}"
    echo -e "${YELLOW}   Cale așteptată: $CREDENTIALS_FILE${NC}"
    echo -e "${YELLOW}   Backend-ul va funcționa, dar Google Drive Service nu va fi disponibil.${NC}"
    echo -e "${YELLOW}   Poți adăuga fișierul mai târziu și să repornești backend-ul.${NC}"
    MISSING_FILES=1
else
    echo -e "${GREEN}✓ Fișier credențiale Google Drive găsit${NC}"
fi

# Verifică structura proiectului
if [ ! -d "backend" ]; then
    echo -e "${RED}Eroare: Directorul 'backend' nu există!${NC}"
    echo "Rulează scriptul din directorul root al proiectului."
    exit 1
fi

if [ ! -d "frontend/frontend" ]; then
    echo -e "${RED}Eroare: Directorul 'frontend/frontend' nu există!${NC}"
    echo "Rulează scriptul din directorul root al proiectului."
    exit 1
fi

echo -e "${GREEN}✓ Structură proiect verificată${NC}"

if [ $MISSING_FILES -eq 1 ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Continuă deployment-ul fără credențiale Google Drive?${NC}"
    echo -e "${YELLOW}   (Backend-ul va funcționa, dar Google Drive Service nu va fi disponibil)${NC}"
    echo ""
    # Dacă rulează într-un mediu non-interactiv, continuă automat
    if [ -t 0 ]; then
        read -r -p "Continuă? (y/n): " response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            echo "Deployment anulat."
            exit 1
        fi
    else
        echo -e "${YELLOW}Mediu non-interactiv detectat. Continuă automat...${NC}"
        sleep 2
    fi
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Deployment FotoIT pe AWS EC2${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}IP EC2:${NC} $EC2_IP"
echo -e "${GREEN}User SSH:${NC} $SSH_USER"
echo -e "${GREEN}Cheie SSH:${NC} $SSH_KEY"
echo ""

# Funcție pentru rularea comenzilor pe EC2
run_remote() {
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$EC2_IP" "$1"
}

# Funcție pentru copierea fișierelor pe EC2
copy_to_remote() {
    scp -i "$SSH_KEY" -o StrictHostKeyChecking=no -r "$1" "$SSH_USER@$EC2_IP:$2"
}

echo -e "${YELLOW}[1/11] Conectare la EC2 și verificare sistem...${NC}"
run_remote "echo 'Conectat cu succes!'"

echo -e "${YELLOW}[2/11] Actualizare sistem și instalare dependențe...${NC}"
run_remote "sudo apt-get update -y"
run_remote "sudo apt-get install -y curl wget git unzip software-properties-common sqlite3"

echo -e "${YELLOW}[3/11] Instalare Java 21 (LTS)...${NC}"
run_remote "sudo apt-get install -y openjdk-21-jdk || sudo apt-get install -y default-jdk"
run_remote "java -version"

echo -e "${YELLOW}[4/11] Instalare Maven...${NC}"
run_remote "sudo apt-get install -y maven"
run_remote "mvn -version"

echo -e "${YELLOW}[5/11] Instalare Node.js 20.x...${NC}"
run_remote "curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
run_remote "sudo apt-get install -y nodejs"
run_remote "node --version && npm --version"

echo -e "${YELLOW}[6/11] Instalare PM2 pentru Next.js...${NC}"
run_remote "sudo npm install -g pm2"

echo -e "${YELLOW}[7/11] Instalare și configurare Nginx...${NC}"
run_remote "sudo apt-get install -y nginx"
run_remote "sudo systemctl enable nginx"

echo -e "${YELLOW}[8/11] Creare structură directoare pe server...${NC}"
run_remote "sudo mkdir -p /opt/fotoit/{backend,frontend,logs}"
run_remote "sudo chown -R $SSH_USER:$SSH_USER /opt/fotoit"

echo -e "${YELLOW}[9/11] Copiere cod backend și frontend (inclusiv credențiale)...${NC}"

# Determină directorul de bază al proiectului (unde e scriptul)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Backup baza de date de pe server (daca exista)..."
run_remote "mkdir -p /opt/fotoit/backups && if [ -f /opt/fotoit/backend/fotoit.db ]; then
    TS=\$(date +%Y-%m-%d_%H%M%S)
    # sqlite3 .backup include si datele din fisierul WAL; fallback la copiere simpla
    if command -v sqlite3 >/dev/null 2>&1; then
        sqlite3 /opt/fotoit/backend/fotoit.db \".backup '/opt/fotoit/backups/fotoit_\$TS.db'\"
    else
        cp /opt/fotoit/backend/fotoit.db* /opt/fotoit/backups/ 2>/dev/null
        for f in /opt/fotoit/backups/fotoit.db*; do mv \"\$f\" \"\${f/fotoit.db/fotoit_\$TS.db}\"; done
    fi
    echo \"✓ Backup salvat in /opt/fotoit/backups (fotoit_\$TS.db)\"
    # Pastreaza doar ultimele 20 de backup-uri
    ls -1t /opt/fotoit/backups/fotoit_*.db 2>/dev/null | tail -n +21 | xargs -r rm -f
else
    echo 'Nu exista baza de date pe server (prima instalare).'
fi"

echo "Copiere backend (baza de date, cache-ul si credentialele locale raman neatinse pe server)..."
run_remote "mkdir -p /opt/fotoit/backend && cd /opt/fotoit/backend && find . -mindepth 1 -maxdepth 1 ! -name 'fotoit.db*' ! -name 'cache' ! -name 'local.env' -exec rm -rf {} +"

# Copiere backend - fara baza de date locala, cache, build si fisiere locale
echo "Copiere structură backend cu tar..."
(cd "$PROJECT_ROOT/backend" && tar czf - --exclude='./fotoit.db*' --exclude='./cache' --exclude='./target' --exclude='./local.env' .) | ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$EC2_IP" "cd /opt/fotoit/backend && tar xzf -"

# Verifică dacă pom.xml a fost copiat corect
echo "Verificare structură backend..."
run_remote "if [ -f '/opt/fotoit/backend/pom.xml' ]; then
    echo '✓ pom.xml copiat cu succes'
    echo 'Structură backend:'
    ls -la /opt/fotoit/backend/ | head -10
else
    echo '❌ EROARE: pom.xml nu a fost găsit!'
    echo 'Conținut director:'
    ls -la /opt/fotoit/backend/
    exit 1
fi"

# Verifică dacă credențialele au fost copiate
echo "Verificare credențiale Google Drive..."
run_remote "if [ -f '/opt/fotoit/backend/src/main/resources/fotoit-gallery-credentials.json' ]; then
    echo '✓ Credențiale Google Drive copiate cu succes'
else
    echo '⚠️  Credențiale Google Drive nu au fost găsite - va trebui să le adaugi manual'
fi"

echo "Copiere frontend..."
run_remote "rm -rf /opt/fotoit/frontend/* /opt/fotoit/frontend/.* 2>/dev/null || true"
run_remote "mkdir -p /opt/fotoit/frontend"
(cd "$PROJECT_ROOT/frontend/frontend" && tar czf - .) | ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$EC2_IP" "cd /opt/fotoit/frontend && tar xzf -"

echo -e "${YELLOW}[10/11] Build și configurare aplicații...${NC}"

# Variabile de productie pentru backend: create o singura data, apoi pastrate intre deploy-uri
echo "Configurare variabile backend (local.env pe server)..."
run_remote "if [ ! -f /opt/fotoit/backend/local.env ]; then
    PASS=\$(openssl rand -base64 18 | tr -d '/+=' | cut -c1-20)
    printf 'ADMIN_PASSWORD=%s
CORS_ALLOWED_ORIGINS=http://$EC2_IP
THYMELEAF_CACHE=true
' \"\$PASS\" > /opt/fotoit/backend/local.env
    chmod 600 /opt/fotoit/backend/local.env
    echo \"✓ Parola admin generata: \$PASS  (o gasesti oricand in /opt/fotoit/backend/local.env)\"
else
    echo '✓ local.env existent pastrat (parola admin neschimbata)'
fi"

# Build backend
echo "Building backend..."
run_remote "cd /opt/fotoit/backend && mvn clean package -DskipTests"

# Build frontend
echo "Building frontend..."
run_remote "cd /opt/fotoit/frontend && npm install --production=false"

# Configurare variabile de mediu pentru frontend (folosește Nginx, nu port direct)
echo "Configurare variabile de mediu frontend..."
run_remote "cat > /opt/fotoit/frontend/.env.production << EOF
NEXT_PUBLIC_API_URL=http://$EC2_IP
NEXT_PUBLIC_SITE_NAME=FotoIT
EOF"

run_remote "cd /opt/fotoit/frontend && npm run build"

# Creare systemd service pentru backend
echo "Configurare systemd service pentru backend..."
run_remote "sudo tee /etc/systemd/system/fotoit-backend.service > /dev/null << 'EOF'
[Unit]
Description=FotoIT Backend Service
After=network.target

[Service]
Type=simple
User=$SSH_USER
WorkingDirectory=/opt/fotoit/backend
EnvironmentFile=-/opt/fotoit/backend/local.env
ExecStart=/usr/bin/java -jar /opt/fotoit/backend/target/Project-0.0.1-SNAPSHOT.jar
Restart=always
RestartSec=10
StandardOutput=append:/opt/fotoit/logs/backend.log
StandardError=append:/opt/fotoit/logs/backend-error.log

[Install]
WantedBy=multi-user.target
EOF"

# Creare script de start pentru frontend
echo "Configurare script start frontend..."
run_remote "cat > /opt/fotoit/frontend/start.sh << 'EOF'
#!/bin/bash
cd /opt/fotoit/frontend
npm start
EOF"
run_remote "chmod +x /opt/fotoit/frontend/start.sh"

# Configurare PM2 pentru frontend
echo "Configurare PM2 pentru frontend..."
run_remote "cd /opt/fotoit/frontend && pm2 delete fotoit-frontend 2>/dev/null || true"
run_remote "cd /opt/fotoit/frontend && NEXT_PUBLIC_API_URL=http://$EC2_IP pm2 start npm --name 'fotoit-frontend' -- start"
run_remote "pm2 save"
run_remote "pm2 startup systemd -u $SSH_USER --hp /home/$SSH_USER | tail -1 | bash || true"

# Configurare Nginx ca reverse proxy
echo "Configurare Nginx..."
run_remote "sudo tee /etc/nginx/sites-available/fotoit > /dev/null << 'EOF'
server {
    listen 80;
    server_name $EC2_IP;

    # Frontend Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8080/api;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Admin Panel
    location /admin {
        proxy_pass http://localhost:8080/admin;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Swagger UI
    location /swagger-ui {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
    }

    # API Docs
    location /v3/api-docs {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
    }
}
EOF"

run_remote "sudo ln -sf /etc/nginx/sites-available/fotoit /etc/nginx/sites-enabled/"
run_remote "sudo rm -f /etc/nginx/sites-enabled/default"
run_remote "sudo nginx -t"

# Configurare firewall
echo "Configurare firewall..."
run_remote "sudo ufw allow 22/tcp"
run_remote "sudo ufw allow 80/tcp"
run_remote "sudo ufw allow 443/tcp"

# Obține IP-ul public al utilizatorului pentru restricție backend
echo "Obținere IP public pentru restricție backend..."
USER_IP=$(curl -s https://api.ipify.org || echo "")
if [ -n "$USER_IP" ]; then
    echo -e "${GREEN}IP public detectat: $USER_IP${NC}"
    echo -e "${YELLOW}Deschidere port 8080 doar pentru IP-ul tău ($USER_IP)...${NC}"
    run_remote "sudo ufw allow from $USER_IP to any port 8080 proto tcp"
    echo -e "${GREEN}✓ Port 8080 deschis doar pentru IP-ul tău${NC}"
    echo -e "${YELLOW}⚠️  IMPORTANT: Configurează și Security Group-ul AWS:${NC}"
    echo -e "${YELLOW}   1. Mergi în AWS Console → EC2 → Security Groups${NC}"
    echo -e "${YELLOW}   2. Selectează Security Group-ul instanței${NC}"
    echo -e "${YELLOW}   3. Inbound Rules → Edit → Add Rule${NC}"
    echo -e "${YELLOW}   4. Type: Custom TCP, Port: 8080, Source: $USER_IP/32${NC}"
else
    echo -e "${YELLOW}⚠️  Nu s-a putut detecta IP-ul public automat${NC}"
    echo -e "${YELLOW}   Deschide manual portul 8080 în Security Group AWS pentru IP-ul tău${NC}"
fi

run_remote "sudo ufw --force enable"

# Pornire servicii
echo "Pornire servicii..."
run_remote "sudo systemctl daemon-reload"
run_remote "sudo systemctl enable fotoit-backend"
run_remote "sudo systemctl restart fotoit-backend"
run_remote "sudo systemctl restart nginx"

# Așteaptă ca backend-ul să pornească
echo "Așteptare pornire backend..."
sleep 10

# Verificare finală credențiale
echo ""
echo -e "${YELLOW}Verificare finală configurare...${NC}"
if run_remote "[ -f '/opt/fotoit/backend/src/main/resources/fotoit-gallery-credentials.json' ]"; then
    echo -e "${GREEN}✓ Credențiale Google Drive: Configurate${NC}"
else
    echo -e "${YELLOW}⚠️  Credențiale Google Drive: Lipsesc (poți adăuga manual mai târziu)${NC}"
    echo -e "${YELLOW}   Cale: /opt/fotoit/backend/src/main/resources/fotoit-gallery-credentials.json${NC}"
fi

# Verificare status
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Verificare Status${NC}"
echo -e "${BLUE}========================================${NC}"

echo -e "${YELLOW}Status Backend:${NC}"
run_remote "sudo systemctl status fotoit-backend --no-pager | head -5"

echo -e "${YELLOW}Status Frontend (PM2):${NC}"
run_remote "pm2 status"

echo -e "${YELLOW}Status Nginx:${NC}"
run_remote "sudo systemctl status nginx --no-pager | head -5"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ✅ Deployment Complet!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${GREEN}🎉 Aplicația este disponibilă la:${NC}"
echo -e "  🌐 Frontend: ${BLUE}http://$EC2_IP${NC}"
echo -e "  🔌 Backend API: ${BLUE}http://$EC2_IP/api${NC}"
echo -e "  📚 Swagger UI: ${BLUE}http://$EC2_IP/swagger-ui.html${NC}"
echo ""
echo -e "${YELLOW}📋 Comenzi utile:${NC}"
echo "  📊 Verificare logs backend:"
echo "     ssh -i $SSH_KEY $SSH_USER@$EC2_IP 'sudo journalctl -u fotoit-backend -f'"
echo ""
echo "  📊 Verificare logs frontend:"
echo "     ssh -i $SSH_KEY $SSH_USER@$EC2_IP 'pm2 logs fotoit-frontend'"
echo ""
echo "  🔄 Restart backend:"
echo "     ssh -i $SSH_KEY $SSH_USER@$EC2_IP 'sudo systemctl restart fotoit-backend'"
echo ""
echo "  🔄 Restart frontend:"
echo "     ssh -i $SSH_KEY $SSH_USER@$EC2_IP 'pm2 restart fotoit-frontend'"
echo ""
echo "  🔄 Restart nginx:"
echo "     ssh -i $SSH_KEY $SSH_USER@$EC2_IP 'sudo systemctl restart nginx'"
echo ""
echo -e "${GREEN}💡 Notă:${NC} Toate fișierele de configurare și credențiale au fost copiate automat!"
echo ""
echo -e "${GREEN}💡 Notă:${NC} Toate fișierele de configurare și credențiale au fost copiate automat!"
echo ""


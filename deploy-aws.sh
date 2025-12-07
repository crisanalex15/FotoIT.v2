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

echo -e "${YELLOW}[1/10] Conectare la EC2 și verificare sistem...${NC}"
run_remote "echo 'Conectat cu succes!'"

echo -e "${YELLOW}[2/10] Actualizare sistem și instalare dependențe...${NC}"
run_remote "sudo apt-get update -y"
run_remote "sudo apt-get install -y curl wget git unzip software-properties-common"

echo -e "${YELLOW}[3/10] Instalare Java 21 (LTS)...${NC}"
run_remote "sudo apt-get install -y openjdk-21-jdk || sudo apt-get install -y default-jdk"
run_remote "java -version"

echo -e "${YELLOW}[4/10] Instalare Maven...${NC}"
run_remote "sudo apt-get install -y maven"
run_remote "mvn -version"

echo -e "${YELLOW}[5/10] Instalare Node.js 20.x...${NC}"
run_remote "curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
run_remote "sudo apt-get install -y nodejs"
run_remote "node --version && npm --version"

echo -e "${YELLOW}[6/10] Instalare PM2 pentru Next.js...${NC}"
run_remote "sudo npm install -g pm2"

echo -e "${YELLOW}[7/10] Instalare și configurare Nginx...${NC}"
run_remote "sudo apt-get install -y nginx"
run_remote "sudo systemctl enable nginx"

echo -e "${YELLOW}[8/10] Creare structură directoare pe server...${NC}"
run_remote "sudo mkdir -p /opt/fotoit/{backend,frontend,logs}"
run_remote "sudo chown -R $SSH_USER:$SSH_USER /opt/fotoit"

echo -e "${YELLOW}[9/10] Copiere cod backend și frontend...${NC}"
echo "Copiere backend..."
run_remote "rm -rf /opt/fotoit/backend/*"
copy_to_remote "backend/" "/opt/fotoit/backend/"

echo "Copiere frontend..."
run_remote "rm -rf /opt/fotoit/frontend/*"
copy_to_remote "frontend/frontend/" "/opt/fotoit/frontend/"

echo -e "${YELLOW}[10/10] Build și configurare aplicații...${NC}"

# Build backend
echo "Building backend..."
run_remote "cd /opt/fotoit/backend && mvn clean package -DskipTests"

# Build frontend
echo "Building frontend..."
run_remote "cd /opt/fotoit/frontend && npm install --production=false"
run_remote "cd /opt/fotoit/frontend && NEXT_PUBLIC_API_URL=http://$EC2_IP:8080 npm run build"

# Configurare variabile de mediu pentru frontend
echo "Configurare variabile de mediu frontend..."
run_remote "cat > /opt/fotoit/frontend/.env.production << EOF
NEXT_PUBLIC_API_URL=http://$EC2_IP:8080
NEXT_PUBLIC_SITE_NAME=FotoIT
EOF"

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
run_remote "cd /opt/fotoit/frontend && NEXT_PUBLIC_API_URL=http://$EC2_IP:8080 pm2 start npm --name 'fotoit-frontend' -- start"
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
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
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
echo -e "${GREEN}  Deployment Complet!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${GREEN}Aplicația este disponibilă la:${NC}"
echo -e "  Frontend: ${BLUE}http://$EC2_IP${NC}"
echo -e "  Backend API: ${BLUE}http://$EC2_IP/api${NC}"
echo -e "  Swagger UI: ${BLUE}http://$EC2_IP/swagger-ui.html${NC}"
echo ""
echo -e "${YELLOW}Comenzi utile:${NC}"
echo "  Verificare logs backend: ssh -i $SSH_KEY $SSH_USER@$EC2_IP 'sudo journalctl -u fotoit-backend -f'"
echo "  Verificare logs frontend: ssh -i $SSH_KEY $SSH_USER@$EC2_IP 'pm2 logs fotoit-frontend'"
echo "  Restart backend: ssh -i $SSH_KEY $SSH_USER@$EC2_IP 'sudo systemctl restart fotoit-backend'"
echo "  Restart frontend: ssh -i $SSH_KEY $SSH_USER@$EC2_IP 'pm2 restart fotoit-frontend'"
echo "  Restart nginx: ssh -i $SSH_KEY $SSH_USER@$EC2_IP 'sudo systemctl restart nginx'"
echo ""


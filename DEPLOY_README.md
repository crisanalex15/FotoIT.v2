# 🚀 Deployment FotoIT pe AWS EC2

Acest script automatizează deployment-ul complet al aplicației FotoIT pe un server AWS EC2.

## 📋 Cerințe Prealabile

1. **Instanță EC2** cu Ubuntu (20.04 sau mai nou)
2. **Cheie SSH** (.pem) pentru conectare la EC2
3. **Security Group** configurat să permită:
   - Port 22 (SSH)
   - Port 80 (HTTP)
   - Port 443 (HTTPS - opțional pentru SSL)

## 🎯 Utilizare

### Pe Linux/Mac sau WSL/Git Bash pe Windows:

```bash
# Fă scriptul executabil (dacă nu e deja)
chmod +x deploy-aws.sh

# Rulează scriptul
./deploy-aws.sh <EC2_IP> <SSH_USER> <SSH_KEY_PATH>
```

### Exemplu:

```bash
./deploy-aws.sh 54.123.45.67 ubuntu ~/.ssh/fotoit-key.pem
```

## 📝 Parametri

- **EC2_IP**: Adresa IP publică sau Elastic IP a instanței EC2
- **SSH_USER**: Utilizatorul SSH (de obicei `ubuntu` pentru Ubuntu AMI)
- **SSH_KEY_PATH**: Calea către fișierul cheii SSH (.pem)

## 🔧 Ce face scriptul?

1. ✅ Se conectează la EC2 prin SSH
2. ✅ Actualizează sistemul și instalează dependențele
3. ✅ Instalează Java 21, Maven, Node.js 20, PM2, Nginx
4. ✅ Copiază codul backend și frontend pe server
5. ✅ Build-ează ambele aplicații
6. ✅ Configurează systemd service pentru backend
7. ✅ Configurează PM2 pentru frontend
8. ✅ Configurează Nginx ca reverse proxy
9. ✅ Configurează firewall (UFW)
10. ✅ Pornește toate serviciile

## 🌐 Acces după deployment

După rularea scriptului, aplicația va fi disponibilă la:

- **Frontend**: `http://<EC2_IP>`
- **Backend API**: `http://<EC2_IP>/api`
- **Swagger UI**: `http://<EC2_IP>/swagger-ui.html`

## 📊 Verificare Status

### Logs Backend:
```bash
ssh -i <SSH_KEY> <SSH_USER>@<EC2_IP> 'sudo journalctl -u fotoit-backend -f'
```

### Logs Frontend:
```bash
ssh -i <SSH_KEY> <SSH_USER>@<EC2_IP> 'pm2 logs fotoit-frontend'
```

### Status Servicii:
```bash
ssh -i <SSH_KEY> <SSH_USER>@<EC2_IP> 'sudo systemctl status fotoit-backend'
ssh -i <SSH_KEY> <SSH_USER>@<EC2_IP> 'pm2 status'
```

## 🔄 Restart Servicii

### Restart Backend:
```bash
ssh -i <SSH_KEY> <SSH_USER>@<EC2_IP> 'sudo systemctl restart fotoit-backend'
```

### Restart Frontend:
```bash
ssh -i <SSH_KEY> <SSH_USER>@<EC2_IP> 'pm2 restart fotoit-frontend'
```

### Restart Nginx:
```bash
ssh -i <SSH_KEY> <SSH_USER>@<EC2_IP> 'sudo systemctl restart nginx'
```

## 📁 Structura pe Server

```
/opt/fotoit/
├── backend/          # Cod backend Spring Boot
├── frontend/         # Cod frontend Next.js
└── logs/            # Loguri aplicații
```

## ⚠️ Note Importante

1. **Prima rulare** poate dura 10-15 minute (instalare dependențe)
2. **Cheia SSH** trebuie să aibă permisiuni corecte (400)
3. **Database SQLite** va fi creat automat în `/opt/fotoit/backend/fotoit.db`
4. **Google Drive credentials** trebuie să fie deja în `backend/src/main/resources/`

## 🐛 Troubleshooting

### Eroare: "Permission denied (publickey)"
- Verifică că cheia SSH are permisiunile corecte: `chmod 400 <cheie.pem>`
- Verifică că folosești user-ul corect (de obicei `ubuntu`)

### Backend nu pornește
- Verifică logs: `sudo journalctl -u fotoit-backend -n 50`
- Verifică că portul 8080 nu e ocupat: `sudo netstat -tlnp | grep 8080`

### Frontend nu pornește
- Verifică logs PM2: `pm2 logs fotoit-frontend`
- Verifică că portul 3000 nu e ocupat: `sudo netstat -tlnp | grep 3000`

### Nginx nu pornește
- Verifică configurația: `sudo nginx -t`
- Verifică logs: `sudo tail -f /var/log/nginx/error.log`


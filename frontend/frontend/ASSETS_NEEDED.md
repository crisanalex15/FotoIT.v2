# 🖼️ Asset-uri Necesare pentru Frontend FotoIT

## 📁 Structura Public Folder

Pentru ca designul să arate exact ca versiunea originală, adaugă următoarele asset-uri în `frontend/frontend/public/`:

```
public/
├── logo-fotoit.png          → Logo FotoIT (din src/Screen1/Fotoit.png)
├── background1.png           → Background pentru hero section
├── background2.png           → Background pentru despre section
├── profil.jpg                → Poza de profil Alex (din src/Screen2/Profil.jpg)
└── instagram.png             → Icon Instagram (din src/instagram.png)
```

---

## 🎨 Asset-uri din Proiectul Original

### **1. Logo FotoIT**
- **Locație originală:** `FotoIT-main/FotoIT-main/src/Screen1/Fotoit.png`
- **Copiază în:** `frontend/frontend/public/logo-fotoit.png`

### **2. Background Images**
- **Background1.png:** `FotoIT-main/FotoIT-main/src/Screen1/Background1.png`
- **Background2.png:** `FotoIT-main/FotoIT-main/src/Screen1/Background2.png`
- **Copiază în:** `frontend/frontend/public/`

### **3. Profil Image**
- **Locație originală:** `FotoIT-main/FotoIT-main/src/Screen2/Profil.jpg`
- **Copiază în:** `frontend/frontend/public/profil.jpg`

### **4. Instagram Icon**
- **Locație originală:** `FotoIT-main/FotoIT-main/src/instagram.png`
- **Copiază în:** `frontend/frontend/public/instagram.png`

---

## 🔧 Cum Adaugi Asset-urile

### **Opțiunea 1: Copiere Manuală**

1. Deschide folderul `FotoIT-main/FotoIT-main/src/`
2. Copiază fișierele necesare
3. Adaugă-le în `frontend/frontend/public/`

### **Opțiunea 2: Comandă PowerShell**

```powershell
# Copiază logo
Copy-Item "FotoIT-main\FotoIT-main\src\Screen1\Fotoit.png" -Destination "frontend\frontend\public\logo-fotoit.png"

# Copiază background-uri
Copy-Item "FotoIT-main\FotoIT-main\src\Screen1\Background1.png" -Destination "frontend\frontend\public\background1.png"
Copy-Item "FotoIT-main\FotoIT-main\src\Screen1\Background2.png" -Destination "frontend\frontend\public\background2.png"

# Copiază profil
Copy-Item "FotoIT-main\FotoIT-main\src\Screen2\Profil.jpg" -Destination "frontend\frontend\public\profil.jpg"

# Copiază Instagram icon
Copy-Item "FotoIT-main\FotoIT-main\src\instagram.png" -Destination "frontend\frontend\public\instagram.png"
```

---

## ⚠️ Fallback-uri

Dacă asset-urile lipsesc, aplicația are fallback-uri:

- **Logo:** Se afișează text "FotoIT" în loc de imagine
- **Background:** Se folosește gradient solid
- **Profil:** Se ascunde dacă nu există
- **Instagram:** Se ascunde dacă nu există

---

## ✅ Verificare

După ce adaugi asset-urile, verifică că:

- [ ] Logo apare în header
- [ ] Background-urile se încarcă corect
- [ ] Poza de profil apare în secțiunea "Despre"
- [ ] Icon-ul Instagram apare în footer

---

**🎨 Design-ul va arăta exact ca versiunea originală după ce adaugi asset-urile!**


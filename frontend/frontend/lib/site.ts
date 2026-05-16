const whatsappMessage = encodeURIComponent(
  "Bună Alex! Am văzut site-ul FotoIT și aș vrea să discutăm despre o ședință foto."
);

export const SITE = {
  name: "FotoIT",
  tagline: "Prinde Momente, Modelează Amintiri",
  email: "alexfotoit@gmail.com",
  phone: "0771277906",
  phoneDisplay: "0771 277 906",
  whatsappUrl: `https://wa.me/40771277906?text=${whatsappMessage}`,
  mailtoUrl:
    "mailto:alexfotoit@gmail.com?subject=Contact%20FotoIT&body=Bună%20Alex%2C%0A%0A",
  instagram: "https://instagram.com/fotoit",
} as const;

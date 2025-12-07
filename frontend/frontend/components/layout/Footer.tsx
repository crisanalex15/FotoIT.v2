/**
 * Footer - Footer în stilul original FotoIT
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1e1e1e] text-[#d4af37] text-center py-4">
      <p>&copy; {currentYear} FotoIT. Toate drepturile rezervate.</p>
    </footer>
  );
}

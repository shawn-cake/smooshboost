import logo from '../../../assets/logo.svg';

export function Header() {
  return (
    <header className="pt-[var(--spacing-12)] pb-4 flex flex-col items-center">
      <img src={logo} alt="SmooshBoost - Compress and optimize images for the web" width={400} />
    </header>
  );
}

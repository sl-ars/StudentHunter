import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-muted text-muted-foreground">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <p>&copy; 2025 StudentHunter. All rights reserved.</p>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link href="/about">About</Link>
              </li>
              <li>
                <Link href="/privacy">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms">Terms of Service</Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  )
}


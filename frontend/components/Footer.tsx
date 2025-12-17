export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Dvorfs Market</h3>
            <p className="text-gray-400">
              Лучший интернет-магазин для всех ваших потребностей
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Ссылки</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="/about" className="hover:text-white">
                  О нас
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-white">
                  Контакты
                </a>
              </li>
              <li>
                <a href="/terms" className="hover:text-white">
                  Условия использования
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Контакты</h4>
            <p className="text-gray-400">Email: info@dvorfs-market.com</p>
            <p className="text-gray-400">Телефон: +7 (999) 123-45-67</p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Dvorfs Market. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}




import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProductGrid from '@/components/ProductGrid'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <section className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Добро пожаловать в Dvorfs Market</h1>
          <p className="text-xl text-gray-600 mb-8">
            Лучшие товары по лучшим ценам
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6">Популярные товары</h2>
          <ProductGrid />
        </section>
      </main>
      <Footer />
    </div>
  )
}


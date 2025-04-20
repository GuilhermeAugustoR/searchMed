import { SearchForm } from "@/components/search-form"
import { FeaturedArticles } from "@/components/featured-articles"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl mb-4">
            MedSearch
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Encontre, traduza e organize artigos médicos para suas pesquisas acadêmicas
          </p>
        </div>

        <SearchForm />

        <div className="mt-16">
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-6">Artigos em Destaque</h2>
          <FeaturedArticles />
        </div>
      </div>
    </div>
  )
}

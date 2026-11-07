import Link from 'next/link';
import { Container } from '@/components/layout/section';
import { buttonClass } from '@/components/ui/button';
import { SearchForm } from '@/components/ui/search-form';
import SiteLayout from './(site)/layout';

export default function NotFound() {
  return (
    <SiteLayout>
      <Container className="py-16 md:py-24">
        <p className="label text-electric-deep">Erro 404</p>
        <h1 className="display mt-3 text-5xl md:text-7xl">
          Esse achado <span className="mark">sumiu</span>.
        </h1>
        <p className="mt-4 max-w-lg text-lg text-nevoa">
          O produto pode ter saído da curadoria ou o link mudou. Tente buscar:
        </p>
        <div className="mt-8 max-w-xl">
          <SearchForm />
        </div>
        <Link href="/em-alta" className={`${buttonClass.primary} mt-8`}>
          Ver o que está em alta
        </Link>
      </Container>
    </SiteLayout>
  );
}

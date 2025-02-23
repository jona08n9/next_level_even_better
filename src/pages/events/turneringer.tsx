import { Layout } from '@/Layout';
import { RelatedContact } from '../../components/RelatedContact/RelatedContact';
import { Hero } from '@/modules/Hero/Hero';

import Head from 'next/head';
import { supabase } from '../../../utils/supabaseClient';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TurneringCards } from '../../components/Cards/TurneringCards';

import { Sponsor } from '../admin/test';

export interface Turnering {
  id: string;
  dato: string;
  tilmelding: string;
  gebyr: number;
  eventNavn: string;
  background_image: string;

  format: string;
  spil: string;
  premie: string;
  beskrivelse: string;
  tilmelding_open: boolean;
  subheader: string;
  sponsorer: Sponsor[];
}

const queryClient = new QueryClient();

export const fetchDBTurneringData = async () => {
  let { data, error } = await supabase.from('turneringer').select('*');
  return data as Turnering[];
};

export default function Turneringer() {
  return (
    <QueryClientProvider client={queryClient}>
      <Head>
        <title>Spændende Gaming Turneringer hos Next Level Gaming: Vis Din Færdighed</title>
        <meta
          name='description'
          content='Deltag i Next Level Gamings episke gaming turneringer. Fra League of Legends til Fortnite, vi har turneringer for alle populære spil. Perfekt for konkurrencedygtige spillere, der vil teste deres færdigheder og vinde præmier. Se vores tidsplan og tilmeld dit hold til vores næste store event.'
        />
      </Head>
      <Layout>
        <main>
          <Hero
            isFrontPage={false}
            buttonProps={{
              children: 'Kontakt os',
              link: '../om-os/kontakt?turnering',
            }}
            content='En turnering er den bedste måde at få testet dine skills. Har du et hold som du gerne vil have testet af? Så er det en af vores turneringer du skal deltage i. Vi afholder turneringer i det mest populære spil.'
            header='De vildeste turneringer'
            redWord={['turneringer']}
          />

          <section>
            <article className='flex justify-center'>
              <div className='spacer w-full'>
                <h2>
                  Find din næste <span className='text-accentCol'>turnering</span>
                </h2>
                <p className='mb-10'>Se de kommende turneringer nedenfor.</p>

                <div className='grid gap-4 lg:grid-cols-3 md:grid-cols-2'>
                  <TurneringCards />
                </div>
              </div>
            </article>
          </section>
          <section>
            <RelatedContact
              header='Du kan altid kontakte os'
              redWord={['kontakte', 'os']}
              subHeader='har du spørgsmål til kommende turneringer?'
              content='Har du spørgsmål angående de kommende turneringer? Måske har du en idé til en turnering, eller vil samarbejde omkring en turnering. Ønsker du at tilmelde dit hold kan det gøres her '
              buttonProps={{
                children: 'Kontakt os om turneringer',
                link: '../om-os/kontakt?turneringer',
              }}
            />
          </section>
        </main>
      </Layout>
    </QueryClientProvider>
  );
}

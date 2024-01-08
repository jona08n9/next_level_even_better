import React from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../../utils/supabaseClient';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Layout } from '@/Layout';
import { format } from 'date-fns';
import { FaCalendar, FaCoins, FaGamepad, FaMoneyBill, FaTrophy } from 'react-icons/fa';
import { BsFillPeopleFill } from 'react-icons/bs';
import { Link } from '@radix-ui/react-navigation-menu';
import Countdown from 'react-countdown';
import { IoGameController } from 'react-icons/io5';
import { Button } from '../../../components/Button/Button';

function page() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [tilmeldingClosed, setTilmeldingClosed] = useState(true);

  const timestamp = data && data.tilmelding;

  const dateObject = new Date(timestamp);

  const countdownDate = Date.now() + Date.parse(timestamp);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data, error } = await supabase
          .from('turneringer')
          .select('*')
          .eq('id', router.query.id);
        if (data) {
          setData(data[0]);
        } else {
          console.error(error);
        }
      } catch (error) {
        console.error(error);
      }
    }

    fetchData();
  }, [router.query.id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from('turneringer')
          .update({ tilmelding_open: 'false' })
          .eq('id', `${data.id}`)
          .select();

        // Handle data or error here if needed
      } catch (error) {
        console.log(error);
      } finally {
        // Code to run regardless of success or failure
      }
    };

    if (Date.now() < Date.parse(timestamp)) {
      fetchData();
      setTilmeldingClosed(false);
      console.log('closed');
    }
  }, [timestamp]);

  console.log('tilmelding open?', !tilmeldingClosed);

  console.log(data);

  console.log(router.query);

  const isFrontPage = false;

  const renderer = ({ hours, minutes, seconds, days, completed }) => {
    return (
      <span>
        {days} dage {hours}:{minutes}:{seconds}
      </span>
    );
  };

  console.log('checker', Date.now());
  console.log('checker 2', Date.now() < Date.parse(timestamp));
  console.log('checker 2', Date.parse(timestamp));

  console.log(format(dateObject, 'dd/MM HH:mm'));

  return (
    <>
      <Layout>
        {data && (
          <>
            <header
              style={{
                backgroundImage: `linear-gradient(to bottom, transparent, rgba(24,23,28, 1) 90%), url(${data.background_image})`,
              }}
              className={`flex min-h-[50vh] justify-center bg-center bg-cover bg-no-repeat pb-10`}
            >
              <div className='w-full spacer max-w-main flex flex-col justify-end'>
                <h1>{data.eventNavn}</h1>
                <h2>{data.spil}</h2>
                <div className='flex justify-between items-center'>
                  <div className='flex gap-4 align-middle'>
                    <div
                      className={`${
                        !tilmeldingClosed ? 'bg-[#08ef8e]' : 'bg-accentCol'
                      } w-fit px-2 self-center rounded-full flex`}
                    >
                      {!tilmeldingClosed ? (
                        <p className='text-primaryCol mt-0 font-medium uppercase'>
                          Tilmelding er åben
                        </p>
                      ) : (
                        <p className='text-primaryCol mt-0 font-medium uppercase'>
                          Tilmelding er lukket
                        </p>
                      )}
                    </div>
                    <h4 className='mt-0'>
                      Tilmeldingsfrist D. {format(dateObject, 'dd/MM HH:mm')}
                    </h4>
                  </div>
                  <div className='flex flex-col gap-2 justify-center'>
                    <p className='text-center text-2xl'>
                      <Countdown date={Date.parse(timestamp)} />
                    </p>
                    <Button
                      className={`${
                        tilmeldingClosed
                          ? 'bg-contrastCol border-contrastCol opacity-70 border cursor-not-allowed'
                          : ''
                      } mt-0 text-2xl font-bold px-8 py-6`}
                      link={`${tilmeldingClosed ? '' : '/om-os/kontakt?turnering'}`}
                    >
                      Tilmeld
                    </Button>
                  </div>
                </div>
              </div>
            </header>
            <section className='flex justify-center'>
              <div className='spacer w-full flex-wrap flex justify-between'>
                <div>
                  <div
                    style={{
                      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    }}
                    className='grid gap-3'
                  >
                    <div className='p-3 w-full flex flex-col gap-2 bg-contrastCol rounded-sm'>
                      <p className='mt-0 flex gap-1 items-center align-middle font-bold uppercase'>
                        <IoGameController /> Spil
                      </p>
                      <p className='mt-0'>{data.spil}</p>
                    </div>
                    <div className='p-3 w-full flex flex-col gap-2 bg-contrastCol rounded-sm'>
                      <p className='mt-0 flex gap-1 items-center align-middle font-bold uppercase'>
                        <FaCalendar size='12' />
                        Dato
                      </p>
                      <p className='mt-0'>{format(new Date(data.dato), 'dd/MM HH:mm')}</p>
                    </div>
                    <div className='p-3 w-full flex flex-col gap-2 bg-contrastCol rounded-sm'>
                      <p className='mt-0 flex gap-1 items-center align-middle font-bold uppercase'>
                        <BsFillPeopleFill />
                        Format
                      </p>
                      <p className='mt-0'>{data.format}</p>
                    </div>
                    <div className='p-3 w-full flex flex-col gap-2 bg-contrastCol rounded-sm'>
                      <p className='mt-0 flex gap-1 items-center font-bold uppercase'>
                        <FaCoins size='12' /> Tilmeldingspris
                      </p>
                      <p className='mt-0'>{data.gebyr}kr.</p>
                    </div>
                    <div className='p-3 w-full flex flex-col gap-2 bg-contrastCol rounded-sm'>
                      <p className='mt-0 flex gap-1 items-center font-bold uppercase'>
                        <FaTrophy size='12' /> Premie
                      </p>
                      <p className='mt-0'>{data.premie}</p>
                    </div>
                  </div>
                  <div>
                    <p className='text-xl uppercase font-bold'>{data.subheader}</p>
                    <p>{data.beskrivelse}</p>
                  </div>
                </div>

                <div>
                  <h4>Sponsorer</h4>
                  <div className='flex flex-row gap-3'>
                    {data.sponsorer.map(sponsor => (
                      <figure>
                        <Image
                          src={sponsor.src}
                          width={200}
                          height={200}
                        />
                        <figcaption className='text-center'>{sponsor.name}</figcaption>
                      </figure>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </Layout>
    </>
  );
}

export default page;

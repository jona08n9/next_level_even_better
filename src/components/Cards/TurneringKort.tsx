import React from 'react';
import Image from 'next/image';
import { IoGameController } from 'react-icons/io5';
import { FaCalendarAlt } from 'react-icons/fa';
import { FaTrophy } from 'react-icons/fa6';

function TurneringKort() {
  return (
    <>
      <div className='flex flex-col border-4 h-full w-fit rounded-lg relative '>
        <div className='flex w-auto h-auto col-start-1 row-start-1 aspect-video rounded overflow-hidden'>
          <Image
            src={'/tournementcardplaceholder.jpg'}
            width={400}
            height={300}
            quality={20}
            style={{ objectFit: 'cover' }}
            alt='Picture of the author'
            className='row-span-1 col-span-1 overflow-hidden'
          />
          <div className='aspect-video absolute flex flex-col w-full h-auto justify-between rounded p-2 bg-gradient-to-t from-primaryCol to-transparent z-10'>
            <div className='flex gap-2 justify-end'>
              <div className='bg-[#08ef8e] w-fit h-min px-2 rounded-full flex self-center uppercase'>
                <small className='mt-0 text-primaryCol font-bold'>
                  Åben for tilmelding
                </small>
              </div>
            </div>
            <div className='flex flex-col justify-end mt-auto'>
              <div className='flex flex-row gap-2'>5v5</div>
            </div>
            <div className=''>
              <h2 className='mt-0 md:truncate md:max-w-[20ch] text-2xl not-italic'>
                League of legends
              </h2>
            </div>
          </div>
        </div>

        <div className='h-fit p-2'>
          <div className='flex flex-row gap-2 mb-2'>
            <IoGameController />
            <p className='mt-0'>Spiltitel</p>
          </div>
          <div className='flex flex-row gap-2 mb-2'>
            <FaCalendarAlt />
            <p className='mt-0'>Set kryds i kalenderen</p>
          </div>
          <div className='flex flex-row gap-2 mb-2'>
            <FaTrophy />
            <p className='mt-0'>Top nice præmie broder</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default TurneringKort;

import { supabase } from '../../../utils/supabaseClient';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { editTurneringAtom, showEditTurneringAtom } from '@/states/store';
import { Turnering } from '../../pages/events/turneringer';
import { SubmitHandler, useForm } from 'react-hook-form';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Label } from '@/components/Inputfields/label';
import ControlledEditableField from '@/components/EditableInputField/ControlledEditableField';
import ControlledEditableTextarea from '@/components/ControlledEditableTextArea/ControlledEditableTextarea';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export const EditTurneringSheet = (turnering: Turnering) => {
  const [editTurnering, setEditTurnering] = useAtom(editTurneringAtom);
  const [showEditTurnering, setShowEditTurnering] = useAtom(showEditTurneringAtom);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  console.log('edit', turnering);

  const queryClient = useQueryClient();

  console.log('atom ', editTurnering);

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    register,
  } = useForm<Turnering>({
    defaultValues: {
      id: editTurnering?.id || turnering?.id,
      dato: editTurnering?.dato,
      tilmelding: editTurnering?.tilmelding,
      gebyr: editTurnering?.gebyr,
      eventNavn: editTurnering?.eventNavn,
      background_image: editTurnering?.background_image || '',
      format: editTurnering?.format,
      spil: editTurnering?.spil || '',
      premie: editTurnering?.premie,
      beskrivelse: editTurnering?.beskrivelse,
      subheader: editTurnering?.subheader,
    },
  });

  useEffect(() => {
    setValue('dato', editTurnering?.dato);
    setValue('background_image', editTurnering?.background_image || '');
    setValue('tilmelding', editTurnering?.tilmelding);
    setValue('gebyr', editTurnering?.gebyr || 0);
    setValue('eventNavn', editTurnering?.eventNavn || '');
    setValue('format', editTurnering?.format || '');
    setValue('spil', editTurnering?.spil || '');
    setValue('premie', editTurnering?.premie || '');
    setValue('beskrivelse', editTurnering?.beskrivelse || '');
    setValue('subheader', editTurnering?.subheader || '');
  }, [editTurnering, setValue]);

  const onSubmit: SubmitHandler<Turnering> = async turneringsData => {
    console.log('submittedData', turneringsData);

    const { data, error } = await supabase
      .from('turneringer')
      .update([turneringsData])
      .eq('id', turneringsData.id)
      .select();

    queryClient.invalidateQueries({ queryKey: ['hydrate-turneringDBData'] });

    if (error) {
      console.error('Supabase error:', error);
      // Handle the error appropriately
      return;
    }

    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setShowEditTurnering(false);
    }, 3000);
  };

  const handleClose = () => {
    setShowEditTurnering(false);
  };

  return (
    <>
      <Sheet
        open={showEditTurnering}
        onOpenChange={() => handleClose()}
      >
        <SheetContent className='w-[400px] overflow-scroll border-none'>
          <SheetHeader>
            <SheetTitle>Rediger turnering</SheetTitle>
            <SheetDescription></SheetDescription>

            {editTurnering?.background_image && (
              <div>
                <Image
                  src={editTurnering?.background_image}
                  className='aspect-video'
                  alt=''
                  width={350}
                  height={200}
                  quality={10}
                />
              </div>
            )}
            <form
              className='flex flex-col gap-3'
              onSubmit={handleSubmit(onSubmit)}
            >
              <div>
                <Label>Turneringstitel</Label>
                <ControlledEditableField
                  control={control}
                  name='eventNavn'
                  type='text'
                  hasError={errors.eventNavn}
                  placeholder='spiltitel'
                />
              </div>

              <div>
                <Label>Subheader</Label>
                <ControlledEditableTextarea
                  control={control}
                  name='subheader'
                  type='text'
                  hasError={errors.subheader}
                  placeholder='Subheader'
                />
              </div>
              <div>
                <Label>Beskrivelse</Label>
                <ControlledEditableTextarea
                  control={control}
                  name='beskrivelse'
                  type='text'
                  hasError={errors.beskrivelse}
                  placeholder='Beskrivelse'
                />
              </div>

              <div>
                <Label>Gebyr</Label>
                <ControlledEditableField
                  control={control}
                  name='gebyr'
                  type='text'
                  hasError={errors.gebyr}
                  placeholder='Gebyr'
                />
              </div>
              <div>
                <Label>Format</Label>
                <ControlledEditableField
                  control={control}
                  name='format'
                  type='text'
                  hasError={errors.format}
                  placeholder='Format'
                />
              </div>

              <div>
                <Label>Premie</Label>
                <ControlledEditableField
                  control={control}
                  name='premie'
                  type='text'
                  hasError={errors.premie}
                  placeholder='Premie'
                />
              </div>

              <div className='flex justify-end gap-3 mt-5'>
                <Button
                  className='max uppercase font-bold hover:bg-transparent border-2 border-accentCol transition-colors duration-300'
                  type='submit'
                  size='sm'
                >
                  {submitting
                    ? 'Gemmer ændringer...'
                    : submitted
                    ? 'Ændringerne er blevet gemt'
                    : 'Gem ændringer'}
                </Button>

                {/*   <SletSpil /> */}
              </div>
            </form>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </>
  );
};

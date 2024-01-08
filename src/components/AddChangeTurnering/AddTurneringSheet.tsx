import { useQueryClient } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { addTurneringAtom, showAddTurneringAtom, sponsorsAtom } from '@/states/store';
import { Turnering } from '../../pages/events/turneringer';
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { supabase } from '../../../utils/supabaseClient';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import ControlledEditableField from '@/components/EditableInputField/ControlledEditableField';
import { Label } from '@/components/Inputfields/label';
import ControlledEditableTextarea from '@/components/ControlledEditableTextArea/ControlledEditableTextarea';
import Image from 'next/image';
import { Check, ChevronsUpDown } from 'lucide-react';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { da } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Game, GameRoot } from '@/Types/gamelist';
import Test, { fileObject } from '@/pages/admin/test';
import { InputDatePicker } from '../InputDatePicker/InputDatePicker';

export const AddTurneringSheet = ({
  turnering,
  gData,
  sponsorData,
}: {
  turnering: Turnering;
  gData: any;
  sponsorData?: fileObject[];
}) => {
  const [addTurnering, setAddTurnering] = useAtom(addTurneringAtom);
  const [showAddTurnering, setShowAddTurnering] = useAtom(showAddTurneringAtom);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [open, setOpen] = useState(false);
  const [chosenGame, setChosenGame] = useState<Game | null>(null);
  const [sponsors, setSponsors] = useAtom(sponsorsAtom);
  const formRef = useRef(null);

  console.log('sponsorData shieeet ', sponsorData && sponsorData);

  console.log('edit', turnering);

  console.log('gameshit', gData);

  const queryClient = useQueryClient();

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    getValues,
    register,
    reset,
  } = useForm<Turnering>({
    defaultValues: {
      dato: addTurnering?.dato,
      tilmelding: addTurnering?.tilmelding,
      gebyr: addTurnering?.gebyr,
      eventNavn: addTurnering?.eventNavn,
      background_image: addTurnering?.background_image || '',
      format: addTurnering?.format,
      spil: addTurnering?.spil || '',
      premie: addTurnering?.premie,
      beskrivelse: addTurnering?.beskrivelse,
      subheader: addTurnering?.subheader,
      sponsorer: sponsors,
    },
  });

  useEffect(() => {
    console.log(chosenGame);
  }, [chosenGame]);

  useEffect(() => {
    console.log('sponsors chosen', sponsors);
  }, [sponsors]);

  /*  useEffect(() => {
    console.log('id value', getValues('id'));
  }, [getValues('id')]); */
  useEffect(() => {
    setValue('dato', addTurnering?.dato);
    setValue('background_image', addTurnering?.background_image || '');
    setValue('tilmelding', addTurnering?.tilmelding);
    setValue('gebyr', addTurnering?.gebyr || 0);
    setValue('eventNavn', addTurnering?.eventNavn || '');
    setValue('format', addTurnering?.format || '');
    setValue('spil', addTurnering?.spil || '');
    setValue('premie', addTurnering?.premie || '');
    setValue('beskrivelse', addTurnering?.beskrivelse || '');
    setValue('subheader', addTurnering?.subheader || '');
  }, [addTurnering, setValue]);

  const onSubmit: SubmitHandler<Turnering> = async turneringsData => {
    console.log('submittedData', turneringsData);

    turneringsData.sponsorer = sponsors;

    const { data, error } = await supabase.from('turneringer').insert([turneringsData]).select();

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
      setShowAddTurnering(false);
      setChosenGame(null);
      setSponsors([]);
      reset();
    }, 3000);
  };

  const handleClose = () => {
    setShowAddTurnering(false);
    setChosenGame(null);
  };

  const handleDaySelect = (date: Date) => {
    const dato = date.toISOString();
    setValue('dato', dato);

    console.log('dato', dato);
  };

  const handleTilmeldingSelect = (date: Date) => {
    const dato = date.toISOString();

    setValue('tilmelding', dato);
    console.log('dato', dato);
  };

  return (
    <>
      <LocalizationProvider
        dateAdapter={AdapterDateFns}
        adapterLocale={da}
      >
        <Sheet
          open={showAddTurnering}
          onOpenChange={() => handleClose()}
        >
          <SheetContent className='w-[400px] overflow-scroll border-none z-50'>
            <SheetHeader>
              <SheetTitle>Tilføj turnering</SheetTitle>
              <SheetDescription></SheetDescription>

              <Popover
                modal={true}
                open={open}
                onOpenChange={setOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    role='combobox'
                    aria-expanded={open}
                    className='w-full max-w-[350px] justify-between'
                  >
                    {chosenGame !== null ? chosenGame.title : 'Vælg et spil'}
                    <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-full max-w-[350px] p-0 '>
                  <Command>
                    <CommandInput placeholder='Search framework...' />
                    <CommandEmpty>No framework found.</CommandEmpty>
                    <CommandGroup className='overflow-scroll h-60'>
                      {gData &&
                        gData.map((game: Game) => (
                          <CommandItem
                            key={game.id}
                            value={game.title}
                            onSelect={() => {
                              const selectedGame = game;
                              console.log('Selected Game:', selectedGame);

                              setValue('background_image', selectedGame.background_image);
                              setValue('spil', selectedGame.title);
                              setChosenGame(selectedGame as Game);
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                chosenGame?.title === game.title ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            {game.title}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>

              {chosenGame && chosenGame.background_image && (
                <div>
                  <Image
                    src={chosenGame.background_image}
                    className='aspect-video'
                    alt=''
                    width={350}
                    height={200}
                    quality={10}
                  />
                </div>
              )}
              <form
                ref={formRef}
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

                <div className='flex flex-col gap-1'>
                  <Label>Dato</Label>

                  <InputDatePicker onDateChange={formattedDate => handleDaySelect(formattedDate)} />
                </div>
                <div className='flex flex-col gap-1'>
                  <Label>Tilmeldingsfrist</Label>

                  <InputDatePicker
                    onDateChange={formattedDate => handleTilmeldingSelect(formattedDate)}
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

                <div>
                  <Label>Sponsorer</Label>
                  <Test sponsors1={sponsorData as fileObject[] | []} />
                </div>

                <div className='flex justify-end gap-3 mt-5'>
                  <Button
                    className='max uppercase font-bold hover:bg-transparent border-2 border-accentCol transition-colors duration-300'
                    type='submit'
                    size='sm'
                  >
                    {submitting
                      ? 'Tilføjer turneringen...'
                      : submitted
                      ? 'Turneringen er blevet tilføjet'
                      : 'Tilføj turnering'}
                  </Button>
                </div>
              </form>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </LocalizationProvider>
    </>
  );
};

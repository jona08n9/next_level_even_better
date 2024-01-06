import { LayoutAdmin } from '@/Layout_Admin';
import { supabase } from '../../../utils/supabaseClient';
import { useRouter } from 'next/navigation';
import { ChangeEvent, useEffect, useState } from 'react';
import { Input2 } from '@/components/ui/input';
import { Input } from '@/components/Inputfields/Inputfield';
import { Label } from '@radix-ui/react-label';
import { Button } from '@/components/ui/button';
import { ImSpinner10 } from 'react-icons/im';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, useForm } from 'react-hook-form';

import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as z from 'zod';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { MdError } from 'react-icons/md';
import { IoIosCheckmarkCircle } from 'react-icons/io';

export async function getServerSideProps() {
  const { data: sponsors, error } = await supabase.storage.from('sponsorer').list('', {
    sortBy: { column: 'name', order: 'asc' },
  });
  if (error) {
    console.log(error);
  }
  return { props: { sponsors } };
}

interface Sponsor {
  src: string;
  name: string;
}

interface fileObject {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: {
    eTag: string;
    size: number;
    mimetype: string;
    cacheControl: string;
    lastModified: string;
    contentLength: number;
    httpStatusCode: number;
  };
}

interface ComboSpons {
  value: string;
  label: string;
}

export default function test({ sponsors }: { sponsors: fileObject[] }) {
  const [file, setFile] = useState<string | null>(null);
  const [fileDetails, setFileDetails] = useState<any>();
  const [sponsorName, setSponsorName] = useState<string>();
  const [selectSponsor, setSelectSponsor] = useState<string>();
  const [sponsorList, setSponsorList] = useState<Sponsor[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [open2, setOpen2] = useState<boolean>(false);
  const [comboValue, setComboValue] = useState<string>();
  const [loader, setLoader] = useState<boolean>(false);
  const [isUploadValid, setIsUploadValid] = useState<boolean>(false);
  const [sponsorForm, setSponsorForm] = useState({ src: '', navn: '' });

  const formSchema = z.object({
    src: z.string().min(1, { message: 'Vælg et billede til sponsoren' }),
    navn: z.string().min(1, {
      message: 'Sponsorens navn skal tastes',
    }),
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      src: sponsorForm.src,
      navn: sponsorForm.navn,
    },
  });

  const handleSponsorSubmit = (e: any) => {
    e.preventDefault();
    uploadImage();
  };

  function handleInputImg(e: ChangeEvent<HTMLInputElement>) {
    console.log(e.target.files);
    console.log(e.target.value);
    if (e.target.files && e.target.files.length > 0) {
      setFile(URL.createObjectURL(e.target.files[0]));
      console.log(e.target.files[0]);
      setFileDetails(e.target.files[0]);
    }
  }

  async function uploadImage() {
    const { data, error } = await supabase.storage.from('sponsorer').upload(`${sponsorName?.replaceAll(' ', '_')}${fileDetails.name.substring(fileDetails.name.lastIndexOf('.'))}`, fileDetails);
    console.log(data);
    addNewSponsorToList();
  }

  async function addNewSponsorToList() {
    const { data } = supabase.storage.from('sponsorer').getPublicUrl(`${sponsorName?.replaceAll(' ', '_')}${fileDetails.name.substring(fileDetails.name.lastIndexOf('.'))}`);
    if (!data) {
      console.log('NAvn:', `${sponsorName}${fileDetails.name.substring(fileDetails.name.lastIndexOf('.'))}`);
      console.log('error in url');
      return;
    }
    console.log(data);
    const sponsName: string = sponsorName as string;
    const sponsorObject: Sponsor = {
      src: data.publicUrl,
      name: sponsName,
    };
    setSponsorList((prevList) => [...prevList, sponsorObject]);
    setSponsorName('');
    setFileDetails('');
    setFile('');
    setOpen2(false);
  }

  async function addSponsorToList() {
    const { data } = supabase.storage.from('sponsorer').getPublicUrl(`${comboValue}`);
    if (!data) {
      console.log('error in url');
      return;
    }
    console.log(data);
    const includesURL = sponsorList.some((sponsor) => {
      // Check if any property in the object includes the searchString
      return Object.values(sponsor).some((src) => typeof src === 'string' && src.includes(data.publicUrl));
    });
    console.log(includesURL);
    if (!includesURL) {
      const sponsName: string = comboValue?.substring(0, comboValue.lastIndexOf('.')).replaceAll(/_/g, ' ') as string;
      const sponsorObject: Sponsor = {
        src: data.publicUrl,
        name: sponsName,
      };
      setSponsorList((prevList) => [...prevList, sponsorObject]);
    }
    setComboValue('');
  }

  // COMMENT OUT FROM HERE TO DISABLE LOGIN GUARD
  const router = useRouter();

  useEffect(() => {
    getSession();
  }, []);

  async function getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (data.session === null) {
      router.push('/login');
    }
  }

  const comboSponsor: ComboSpons[] = sponsors.map((item: fileObject) => ({
    value: item.name,
    label: item.name.substring(0, item.name.lastIndexOf('.')).replaceAll(/_/g, ' '),
  }));
  // COMMENT OUT TO HERE TO DISABLE LOGIN GUARD

  return (
    <>
      <LayoutAdmin>
        <main className='spacer'>
          <h1 className='mt-20' onClick={() => console.log(fileDetails)}>
            {' '}
            TEST site - For storage upload{' '}
          </h1>
          <div className='flex flex-row gap-2'>
            <button className='border border-white p2' onClick={() => console.log(sponsors)}>
              Sponsors
            </button>
            <button className='border border-white p2' onClick={() => console.log(selectSponsor)}>
              selectValue
            </button>
            <button className='border border-white p2' onClick={() => console.log(comboSponsor)}>
              comboSponsor
            </button>
            <button className='border border-white p2' onClick={() => console.log(comboValue)}>
              comboValue
            </button>
            <button className='border border-white p2' onClick={() => console.log(sponsorList)}>
              sponsorList
            </button>
          </div>
          <p>
            Findes sponsor ikke på listen?{' '}
            <span className='text-accentCol font-semibold cursor-pointer' onClick={() => setOpen2(true)}>
              Tilføj ny sponsor ved at klikke her
            </span>
          </p>
          <div>
            {/* <Select onValueChange={(e) => setSelectSponsor(e)}>
              <SelectTrigger className='w-fit'>
                <SelectValue placeholder='Vælg ekisterende sponsor' />
              </SelectTrigger>
              <SelectContent>
                {sponsors.map((image: any) => (
                  <SelectItem value={image.name}>{image.name.substring(0, image.name.lastIndexOf('.')).replaceAll(/_/g, ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select> */}
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button variant='ghost' role='combobox' aria-expanded={open} className='w-[200px] justify-between border-b-2 border-white'>
                  {comboValue ? comboSponsor.find((sponsor: any) => sponsor.value === comboValue)?.label : 'Vælg sponsor...'}
                  <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-[200px] p-0'>
                <Command>
                  <CommandInput placeholder='Find sponsor...' />
                  <CommandEmpty>Ingen sponsorer fundet.</CommandEmpty>
                  <CommandGroup>
                    {comboSponsor.map((sponsor: any) => (
                      <CommandItem
                        key={sponsor.value}
                        value={sponsor.value}
                        onSelect={(currentValue) => {
                          console.log(currentValue);
                          setComboValue(currentValue === comboValue?.toLowerCase() ? '' : sponsor.value);
                          setOpen(false);
                        }}
                      >
                        <Check className={cn('mr-2 h-4 w-4 text-white', comboValue === sponsor.value ? 'opacity-100' : 'opacity-0')} />
                        {sponsor.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            {comboValue ? (
              <Button className='max-w-fit mt-0' variant='secondary' onClick={() => addSponsorToList()}>
                Tilføj sponsor
              </Button>
            ) : (
              <Button className='max-w-fit mt-0 text-black' variant='secondary' onClick={() => addSponsorToList()} disabled>
                Tilføj sponsor
              </Button>
            )}
          </div>
          <div>
            <h4>Sponsor liste</h4>
            {sponsorList.length < 1 ? (
              <p>Ingen sponsorer tilføjet</p>
            ) : (
              <article className='sponsorCards'>
                {sponsorList.map((sponsor) => (
                  <figure>
                    <img src={sponsor.src} alt={`Sponsor image for ${sponsor.name}.`} className='w-full' />
                    <figcaption className='inline-block'>{sponsor.name}</figcaption>
                  </figure>
                ))}
              </article>
            )}
          </div>
          <Dialog open={open2} onOpenChange={setOpen2}>
            <DialogContent className='sm:max-w-[425px]'>
              <DialogHeader>
                <DialogTitle>Tilføj Sponsor</DialogTitle>
                <DialogDescription>Upload et billede og tilføj et navn til den nye sponsor. Denne tilføjes til listen over nuværende sponsorer og gemmes til brug for fremtidige events</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSponsorSubmit}>
                <div className='flex flex-col gap-0.5 mt-6'>
                  <Label htmlFor='sponsImg'>Upload Sponsor Logo</Label>
                  <Input2 id='sponsImg' type='file' onChange={handleInputImg} />
                </div>
                <div className='flex flex-col gap-0.5 m-6'>
                  <Label htmlFor='sponsName'>Sponsor navn</Label>
                  <Input id='sponsName' type='text' value={sponsorName} onChange={(e) => setSponsorName(e.target.value)} />
                </div>
                {file && (
                  <>
                    <Label> Sponsor Billede Preview</Label>
                    <img src={file} alt='Uploaded file' width='150' height='auto' />
                  </>
                )}
                <DialogFooter>
                  <Button>Gem og tilføj sponsor</Button>
                </DialogFooter>
              </form>
              {/* <Form>
                <form onSubmit={form.handleSubmit(handleSponsorSubmit)}>
                  <FormField
                    // control={form.control}
                    name='src'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vælg Fil</FormLabel>
                        <FormControl>
                          <div style={{ position: 'relative' }} className={form.formState.errors.src || isUploadValid === false ? 'shake' : ''}>
                            <Input2 id='sponsImg' type='file' onChange={handleInputImg} />
                            {form.formState.errors.src || isUploadValid === false ? (
                              <div className='absolute top-2 right-0 pr-3 flex items-center pointer-events-none'>
                                <div>
                                  <MdError className={'text-red-500 text-2xl'} />
                                </div>
                              </div>
                            ) : form.formState.isSubmitted && !form.formState.errors.src ? (
                              <div className='absolute top-2 right-0 pr-3 flex items-center pointer-events-none'>
                                <div>
                                  <IoIosCheckmarkCircle className={'text-green-500 text-2xl'} />
                                </div>
                              </div>
                            ) : (
                              ''
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    // control={form.control}
                    name='navn'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sponsor Navn</FormLabel>
                        <FormControl>
                          <div style={{ position: 'relative' }} className={form.formState.errors.navn || isUploadValid === false ? 'shake' : ''}>
                            <Input id='sponsNavn' type='text' value={sponsorName} onChange={(e) => setSponsorName(e.target.value)} />
                            {form.formState.errors.navn || isUploadValid === false ? (
                              <div className='absolute top-2 right-0 pr-3 flex items-center pointer-events-none'>
                                <div>
                                  <MdError className={'text-red-500 text-2xl'} />
                                </div>
                              </div>
                            ) : form.formState.isSubmitted && !form.formState.errors.navn ? (
                              <div className='absolute top-2 right-0 pr-3 flex items-center pointer-events-none'>
                                <div>
                                  <IoIosCheckmarkCircle className={'text-green-500 text-2xl'} />
                                </div>
                              </div>
                            ) : (
                              ''
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}
            </DialogContent>
          </Dialog>
        </main>
      </LayoutAdmin>
    </>
  );
}

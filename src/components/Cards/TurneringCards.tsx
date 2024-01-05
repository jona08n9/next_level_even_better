import { useQuery } from '@tanstack/react-query';
import { fetchDBTurneringData } from '../../pages/events/turneringer';
import Link from 'next/link';
import { Card } from './Card';

export const TurneringCards = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['hydrate-turneringer'],
    queryFn: () => fetchDBTurneringData(),
  });

  console.log(data);

  return (
    data &&
    data.map((turnering) => (
      <Link href={`turnering/${turnering.id}`}>{turnering.eventNavn}</Link>
    ))
  );
};

export default TurneringCards;

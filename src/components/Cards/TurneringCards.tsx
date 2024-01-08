import { useQuery } from '@tanstack/react-query';
import { fetchDBTurneringData } from '../../pages/events/turneringer';
import Link from 'next/link';
import { Card } from './Card';
import TurneringKort from './TurneringKort';

export const TurneringCards = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['hydrate-turneringer'],
    queryFn: () => fetchDBTurneringData(),
  });

  console.log(data);

  return (
    data &&
    data.map((turnering) => (
      <Link href={`turnering/${turnering.id}`}>
        <TurneringKort datas={turnering} />
      </Link>
    ))
  );
};

export default TurneringCards;

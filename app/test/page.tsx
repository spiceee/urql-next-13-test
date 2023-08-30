'use client';

import { Suspense } from 'react';
import { useQuery, gql } from '@urql/next';

export default function Page() {
  return (
    <Suspense>
      <Pokemons />
    </Suspense>
  );
}

const PokemonsQuery = gql`
  query {
    pokemons(limit: 10) {
      id
      name
    }
  }
`;

function Pokemons() {
  const [result] = useQuery({ query: PokemonsQuery });

  console.log('result', result.data);

  return (
    <main>
      <h1>This is rendered as part of SSR</h1>
      <ul>
        {result.data.pokemons.map((x: any) => (
          <li key={x.id}>{x.name}</li>
        ))}
      </ul>
    </main>
  );
}
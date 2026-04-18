// src/components/pet/PetCard.tsx
export default function PetCard({ pet }: any) {
  return (
    <div className="border p-3 rounded-lg">
      <img src={pet.avatar} className="w-20 h-20 rounded-full" />
      <h4>{pet.name}</h4>
    </div>
  );
}
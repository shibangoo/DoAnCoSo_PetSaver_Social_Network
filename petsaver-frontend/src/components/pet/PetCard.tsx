// src/components/pet/PetCard.tsx
export default function PetCard({ pet }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col items-center text-center hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer relative group">
      
      {/* Avatar */}
      <div className="w-24 h-24 rounded-full overflow-hidden mb-3 border-4 border-orange-50 relative">
        {pet.avatar ? (
          <img src={pet.avatar} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" alt={pet.name} />
        ) : (
          <div className="w-full h-full bg-orange-100 flex items-center justify-center text-3xl">🐾</div>
        )}
      </div>

      {/* Info */}
      <h4 className="font-bold text-gray-800 text-lg mb-1 truncate w-full px-2">{pet.name}</h4>
      <p className="text-sm text-gray-500 font-medium">
        {pet.species} {pet.breed ? `• ${pet.breed}` : ''}
      </p>
      {pet.age !== null && (
        <p className="text-xs text-gray-400 mt-1">{pet.age} tuổi</p>
      )}

      {/* Tags */}
      {pet.isAdopted && (
        <span className="absolute top-3 right-3 bg-green-100 text-green-600 text-[10px] font-bold px-2 py-1 rounded-full">
          Đã nhận nuôi
        </span>
      )}
    </div>
  );
}
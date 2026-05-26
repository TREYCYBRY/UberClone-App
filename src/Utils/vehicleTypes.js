const vehicleTypes = [
    {
      id: 'economy',
      label: 'Economy',
      description: '4 passengers · Low price',
      icon: '🚗',
      baseFare: 3500,       // Base fare in COP
      pricePerKm: 1200,     // Price per kilometer in COP
      capacity: 4,
    },
    {
      id: 'xl',
      label: 'XL',
      description: '6 passengers · Extra space',
      icon: '🚐',
      baseFare: 5500,
      pricePerKm: 1800,
      capacity: 6,
    },
    {
      id: 'premium',
      label: 'Premium',
      description: '4 passengers · High-end',
      icon: '🚘',
      baseFare: 8000,
      pricePerKm: 2500,
      capacity: 4,
    },
  ];
  
  export default vehicleTypes;
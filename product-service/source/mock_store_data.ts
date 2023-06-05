// TASK 4 store data template (product model):
//
//    id -  uuid (Primary key) (uuid substituted for a simple id::INT)
//    title - text, not null
//    description - text
//    price - integer

export const MockStoreData = [
  {
    id: "1",
    title: "Mock Data Generator EVO 1",
    description:
      "Perfect for cases like this!",
    price: 1,
  },
  {
    id: "2",
    title: "5G is killing you! How to save yourself using only a simple tinfoil hat",
    description:
      "Save yourself and your family today",
    price: 2,
  },
  {
    id: "3",
    title: "Fake UUID Generator",
    description:
      "Perfect to mess with databases, as it contains duplicates!",
    price: 1,
  },
  {
    id: "4",
    title: "In Noise We Trust",
    description:
      "ML model that substitutes input data with gaussian noise",
    price: 1,
  },
  {
    id: "5",
    title: "PostgreSQL",
    description:
      "It's not free anymore",
    price: 10,
  },
  {
    id: "6",
    title: "It's raining men",
    description:
      "Hallelujah",
    price: 100,
  },
  {
    id: "7",
    title: "A descriptive guide into government PsyOps",
    description:
      "Vitalik Buterin cannot be trusted",
    price: 666,
  },
];
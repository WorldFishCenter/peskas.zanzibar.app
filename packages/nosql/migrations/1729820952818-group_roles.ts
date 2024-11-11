import getModels from "./connect";

export async function up (): Promise<void> {
  const { BmuModel } = await getModels();

  const permissions = await BmuModel.insertMany([
    {
      BMU: "Bureni",
      size_km: 1.27,
    },
    {
      BMU: "Chale",
      size_km: 2.65,
    },
    {
      BMU: "Gazi",
      size_km: 6.55,
    },
    {
      BMU: "Jimbo",
      size_km: 14,
    },
    {
      BMU: "Kanamai",
      size_km: 5.53,
    },
    {
      BMU: "Kenyatta",
      size_km: 3.6,
    },
    {
      BMU: "Kibuyuni",
      size_km: 8.2,
    },
    {
      BMU: "Kijangwani",
      size_km: 0.88,
    },
    {
      BMU: "Kuruwitu",
      size_km: 1.42,
    },
    {
      BMU: "Marina",
      size_km: 4,
    },
    {
      BMU: "Mgwani",
      size_km: 5.4,
    },
    {
      BMU: "Mkwiro",
      size_km: 6.56,
    },
    {
      BMU: "Msumarini",
      size_km: 1.6,
    },
    {
      BMU: "Mtwapa",
      size_km: 4.96,
    },
    {
      BMU: "Mvuleni",
      size_km: 2.45,
    },
    {
      BMU: "Mwaepe",
      size_km: 4.22,
    },
    {
      BMU: "Mwanyaza",
      size_km: 2.45,
    },
    {
      BMU: "Nyali",
      size_km: 4,
    },
    {
      BMU: "Reef",
      size_km: 5.02,
    },
    {
      BMU: "Shimoni",
      size_km: 14.85,
    },
    {
      BMU: "Tradewinds",
      size_km: 3.07,
    },
    {
      BMU: "Vanga",
      size_km: 21.89,
    },{
      BMU: "Vipingo",
      size_km: 1.49,
    },{
      BMU: "Wasini",
      size_km: 5.89,
    },
  ]);

}

export async function down (): Promise<void> {
  const { BmuModel } = await getModels();
  await BmuModel.deleteMany();
}
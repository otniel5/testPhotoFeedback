export const analyzePhoto = async (photo: any) => {
  // For POC purposes, return mock data
  // Simulating API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return {
    positives: [
      "Great composition with the rule of thirds",
      "Beautiful natural lighting",
      "Sharp focus on the main subject",
    ],
    suggestions: [
      "Consider adjusting the horizon to be perfectly level",
      "Try reducing the highlights in the sky",
      "The foreground could use more detail",
    ],
  };
};

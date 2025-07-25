
'use server';

import { predictLocation, type PredictLocationInput } from "@/ai/flows/predict-location";

export async function getPrediction(input: PredictLocationInput) {
    return await predictLocation(input);
}

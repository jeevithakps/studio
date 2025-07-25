import { config } from 'dotenv';
import { z } from 'zod';
import Handlebars from 'handlebars';
config();

import '@/ai/flows/predict-location.ts';
import '@/ai/flows/generate-reminders.ts';

Handlebars.registerHelper('lookup', (array, key, value) => {
    const item = array.find(item => item.name === key);
    return item ? item[value] : 'Unknown Location';
});

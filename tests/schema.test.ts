import { changeFanSpeedSchema } from '../src/schemas/changeFanSpeed';

it('validates fan speed array', async () => {
  await expect(changeFanSpeedSchema.validate({ fans: [50, 60] })).resolves.toBeDefined();
  await expect(changeFanSpeedSchema.validate({ fans: [5] })).rejects.toBeDefined();
});

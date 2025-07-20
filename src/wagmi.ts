import { http, createConfig } from 'wagmi';
import { kairos } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [kairos], 
  connectors: [
    injected() 
  ],
  transports: {
    [kairos.id]: http()
  },
});
export {
  injectMetadata,
  validateMetadataForFormat,
  hasMetadataToInject,
  getDefaultMetadataOptions,
  type MetadataInjectionResult,
} from './metadataInjector';

export { injectJpgMetadata, buildExifBytes } from './jpgMetadata';
export { injectPngMetadata } from './pngMetadata';
export { injectWebpMetadata } from './webpMetadata';


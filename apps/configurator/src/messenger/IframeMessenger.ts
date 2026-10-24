import {
  ViewerReadyEvent,
  ConfigurationChangedEvent,
  RequestAddToCartEvent,
  SetConfigurationCommandSchema,
  RingConfiguration
} from '@configurator/contracts';

export class IframeMessenger {
  private static allowedOrigins: string[] = ['*']; // Can be customized via window.__CONFIGURATOR_ALLOWED_ORIGINS__

  public static init(onSetConfiguration: (partial: Partial<RingConfiguration>) => void): () => void {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin if restricted
      if (this.allowedOrigins[0] !== '*' && !this.allowedOrigins.includes(event.origin)) {
        console.warn(`[IframeMessenger] Untrusted message origin rejected: ${event.origin}`);
        return;
      }

      if (!event.data || typeof event.data !== 'object') return;

      if (event.data.type === 'SET_CONFIGURATION') {
        const parsed = SetConfigurationCommandSchema.safeParse(event.data);
        if (parsed.success) {
          onSetConfiguration(parsed.data.payload);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }

  public static notifyViewerReady(productId: string, modelId: string): void {
    if (typeof window === 'undefined' || window.parent === window) return;

    const event: ViewerReadyEvent = {
      type: 'VIEWER_READY',
      payload: {
        productId,
        modelId,
        version: '1.0.0'
      }
    };

    window.parent.postMessage(event, '*');
  }

  public static notifyConfigurationChanged(config: RingConfiguration, estimatedPriceUSD: number, previewThumbnailUrl?: string): void {
    if (typeof window === 'undefined' || window.parent === window) return;

    const event: ConfigurationChangedEvent = {
      type: 'CONFIGURATION_CHANGED',
      payload: {
        configuration: config,
        estimatedPriceUSD,
        previewThumbnailUrl
      }
    };

    window.parent.postMessage(event, '*');
  }

  public static requestAddToCart(config: RingConfiguration, snapshotDataUrl?: string): void {
    if (typeof window === 'undefined' || window.parent === window) return;

    const event: RequestAddToCartEvent = {
      type: 'REQUEST_ADD_TO_CART',
      payload: {
        configuration: config,
        snapshotDataUrl
      }
    };

    window.parent.postMessage(event, '*');
  }
}

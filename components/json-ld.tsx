import { serializeJsonLd } from '@/lib/schema-org';

interface JsonLdProps {
  data: Record<string, unknown>;
}

/** Suntik structured data JSON-LD — dokumen terkandung, indexable (docs/35 T6). */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}

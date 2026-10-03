export function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output with "<" escaped so content can't close the tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

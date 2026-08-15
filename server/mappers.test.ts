import { describe, expect, it } from "vitest";
import { toBookRecord, toCategoryRecord, toUser } from "./_core/mappers";

describe("mappers (Supabase row -> app record)", () => {
  it("maps a users row to the app User shape", () => {
    const user = toUser({
      id: "00000000-0000-0000-0000-000000000001",
      name: "Ada",
      email: "ada@example.com",
      role: "admin",
      last_signed_in: "2026-01-01T00:00:00.000Z",
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    });

    expect(user.id).toBe("00000000-0000-0000-0000-000000000001");
    expect(user.role).toBe("admin");
    expect(user.lastSignedIn).toBeInstanceOf(Date);
  });

  it("maps a books row (with embedded author/category) to a BookRecord", () => {
    const book = toBookRecord({
      id: 1,
      title: "The Shape of Silence",
      slug: "the-shape-of-silence",
      description: "A novel.",
      cover_url: null,
      pdf_key: null,
      page_count: 220,
      status: "published",
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
      authors: { name: "Jane Doe" },
      categories: { name: "Fiction", slug: "fiction" },
    });

    expect(book.authorName).toBe("Jane Doe");
    expect(book.categorySlug).toBe("fiction");
    expect(book.status).toBe("published");
  });

  it("handles array-typed embeds (possible with PostgREST aliases)", () => {
    const book = toBookRecord({
      id: 2,
      title: "Maps & Mirrors",
      slug: "maps-and-mirrors",
      description: "An atlas.",
      cover_url: null,
      pdf_key: null,
      page_count: 10,
      status: "draft",
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
      authors: [{ name: "K" }],
      categories: [{ name: "Science", slug: "science" }],
    });

    expect(book.authorName).toBe("K");
    expect(book.categoryName).toBe("Science");
  });

  it("maps a categories row to a CategoryRecord", () => {
    const category = toCategoryRecord({
      id: 3,
      name: "Fiction",
      slug: "fiction",
      description: "Novels.",
      created_at: "2026-01-01T00:00:00.000Z",
    });

    expect(category.name).toBe("Fiction");
    expect(category.createdAt).toBeInstanceOf(Date);
  });
});

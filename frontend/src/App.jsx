import { useCallback, useState } from "react";
import { Star } from "lucide-react";
import { AIInput } from "@/components/ui/ai-input";
import { ShiningText } from "@/components/ui/shining-text";

function Chip({ text }) {
      return <span className="chip">{text}</span>;
}

function MetaItem({ label, value }) {
      if (!value) return null;
      return (
            <div className="meta-item">
                  <span className="k">{label}</span>
                  <span className="v">{value}</span>
            </div>
      );
}

function ErrorCard({ message }) {
      return (
            <section className="card error-card">
                  <div className="error-head">
                        <h2>Error</h2>
                  </div>
                  <p className="error-message">{message}</p>
            </section>
      );
}

function MovieResult({ movie }) {
      return (
            <section className="card result">
                  <div className="result-head">
                        <h2>{movie.name || "Untitled"}</h2>
                        {movie.rating != null && (
                              <span className="rating">
                                    <Star className="w-3.5 h-3.5" fill="currentColor" strokeWidth={0} />
                                    {movie.rating}
                              </span>
                        )}
                  </div>

                  {movie.description && <p className="description">{movie.description}</p>}

                  <div className="meta-grid">
                        <MetaItem label="Director" value={movie.director} />
                        <MetaItem label="Country" value={movie.country} />
                        <MetaItem label="Language" value={movie.language} />
                        <MetaItem label="Release Date" value={movie.release_date} />
                        <MetaItem label="Runtime" value={movie.runtime_minutes ? `${movie.runtime_minutes} min` : null} />
                  </div>

                  <div className="chip-group">
                        {movie.genres?.length > 0 && (
                              <div className="chip-row">
                                    <span className="chip-label">Genres</span>
                                    <div className="chips">
                                          {movie.genres.map((g) => (
                                                <Chip key={g} text={g} />
                                          ))}
                                    </div>
                              </div>
                        )}
                        {movie.cast?.length > 0 && (
                              <div className="chip-row">
                                    <span className="chip-label">Cast</span>
                                    <div className="chips">
                                          {movie.cast.map((c) => (
                                                <Chip key={c} text={c} />
                                          ))}
                                    </div>
                              </div>
                        )}
                  </div>

                  <details className="raw-json">
                        <summary>Raw JSON</summary>
                        <pre>{JSON.stringify(movie, null, 2)}</pre>
                  </details>
            </section>
      );
}

export default function App() {
      const [movie, setMovie] = useState(null);
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState("");

      const extract = useCallback(async (paragraph) => {
            const trimmed = paragraph.trim();
            setError("");

            if (!trimmed) {
                  setError("Enter a paragraph first.");
                  return;
            }

            setLoading(true);
            setMovie(null);

            try {
                  const res = await fetch("/api/extract", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ paragraph: trimmed }),
                  });
                  if (!res.ok) {
                        const data = await res.json().catch(() => ({}));
                        const errorMessage = data.detail || `Request failed (${res.status})`;

                        // Parse quota errors for better display
                        if (errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes("quota")) {
                              const quotaMatch = errorMessage.match(/limit: (\d+)/);
                              const retryMatch = errorMessage.match(/Please retry in ([\d.]+)s/);
                              const limit = quotaMatch ? quotaMatch[1] : "your";
                              const retryTime = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) : null;

                              let formattedError = `API quota exceeded (limit: ${limit} requests/day).`;
                              if (retryTime) {
                                    formattedError += ` Please retry in ${retryTime} seconds.`;
                              }
                              throw new Error(formattedError);
                        }

                        throw new Error(errorMessage);
                  }

                  setMovie(await res.json());
            } catch (err) {
                  setError(err.message || "Something went wrong.");
            } finally {
                  setLoading(false);
            }
      }, []);

      return (
            <>
                  <main className="page">
                        <h1 className="page-title">CineSage</h1>
                        <p className="tagline">Extract structured movie information from unstructured paragraphs</p>
                        <section className="prompt-area" aria-label="Movie paragraph input">
                              <AIInput placeholder="Past your raw paragraph" onSubmit={extract} disabled={loading} className="py-0" />
                              <div className="actions">{loading && <ShiningText text="Extracting movie details..." />}</div>
                        </section>

                        {error && <ErrorCard message={error} />}
                        {movie && <MovieResult movie={movie} />}
                  </main>
            </>
      );
}

import { useState, useEffect } from 'react';

interface LoginProps {
  onLogin: (password: string) => void;
  error?: string;
}

export function Login({ onLogin, error: externalError }: LoginProps) {
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(externalError || '');

  // Update error when external error changes
  useEffect(() => {
    if (externalError) {
      setError(externalError);
    }
  }, [externalError]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }
    onLogin(password);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600&display=swap');
        .garamond {
          font-family: 'EB Garamond', serif;
        }
      `}</style>
      
      <div className="min-h-screen bg-background relative">
        {/* Login button in top left */}
        <div className="absolute top-8 left-8">
          {!showPasswordInput ? (
            <button
              onClick={() => setShowPasswordInput(true)}
              className="garamond text-lg text-foreground/60 hover:text-foreground transition-colors"
            >
              [login]
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="password"
                className="px-3 py-1 border border-border/30 rounded bg-background focus:outline-none focus:ring-1 focus:ring-foreground/20 garamond text-base w-40"
                autoFocus
                onBlur={() => {
                  if (!password) {
                    setTimeout(() => setShowPasswordInput(false), 200);
                  }
                }}
              />
              <button
                type="submit"
                className="garamond text-base text-foreground/60 hover:text-foreground transition-colors"
              >
                →
              </button>
            </form>
          )}
          {error && (
            <p className="garamond text-sm text-red-500 mt-2">{error}</p>
          )}
        </div>

        {/* Content */}
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="max-w-3xl w-full">
            <div className="text-center mb-16">
              <h1 className="garamond text-5xl font-medium mb-6 tracking-tight">
                Tjalling van der Schaar
              </h1>
              <p className="garamond text-xl text-muted-foreground">
                tjallingvdschaar[at]gmail[dot]com
              </p>
            </div>

            <div className="space-y-10 text-left">
              {/* Awards */}
              <section>
                <h2 className="garamond text-2xl font-medium mb-4 pb-2 border-b border-border/20">Recognition</h2>
                <div className="garamond text-sm space-y-3 leading-relaxed">
                  <p className="text-foreground font-medium">Forbes Magazine — One of 100 most promising change-makers in the world</p>
                  <p className="text-foreground font-medium">Rise Global Scholar — Recipient of world's largest and most selective scholarship (Schmidt Futures & Rhodes Trust)</p>
                  <p className="text-foreground font-medium">Millennium Fellow — By the United Nations for Academic Impact</p>
                  <p className="text-foreground font-medium">Royal Dutch Academy for Arts and Sciences — Top 10 among high school research papers in the Netherlands</p>
                </div>
              </section>

              {/* Education */}
              <section>
                <h2 className="garamond text-2xl font-medium mb-4 pb-2 border-b border-border/20">Education</h2>
                <div className="garamond text-sm space-y-4 leading-relaxed">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="text-foreground font-medium mb-1">Minerva University — BSc. AI and BSc. Biology</p>
                      <p className="text-muted-foreground">World's most selective university. Studying across seven countries over four years.</p>
                    </div>
                    <span className="text-xs text-muted-foreground/60 whitespace-nowrap">2022 - 2026</span>
                  </div>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="text-foreground font-medium">University of Amsterdam — Information Sciences</p>
                    </div>
                    <span className="text-xs text-muted-foreground/60 whitespace-nowrap">2021 - 2022</span>
                  </div>
                </div>
              </section>

              {/* Experience */}
              <section>
                <h2 className="garamond text-2xl font-medium mb-4 pb-2 border-b border-border/20">Experience</h2>
                <div className="garamond text-sm space-y-4 leading-relaxed">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="text-foreground font-medium mb-1">Founders Associate — nsave</p>
                      <p className="text-muted-foreground">Y Combinator & Sequoia Capital backed. Making sense of chaos, turning it into structure.</p>
                    </div>
                    <span className="text-xs text-muted-foreground/60 whitespace-nowrap">Apr - Oct 2025</span>
                  </div>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="text-foreground font-medium mb-1">Co-Founder / CEO — YouCademy</p>
                      <p className="text-muted-foreground">Assembled team including co-founder of Booking.com, ex-ML group manager at C.H. Robinson, Rise Global Scholar, and Minerva graduates. Conducted fundraising rounds, pitched to tier-one venture firms. Used in classrooms.</p>
                    </div>
                    <span className="text-xs text-muted-foreground/60 whitespace-nowrap">Jan - Dec 2024</span>
                  </div>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="text-foreground font-medium mb-1">Professional Hockey Trainer — AH&BC</p>
                      <p className="text-muted-foreground">Head coach at Amsterdam's Hockey & Bandy Club, holder of most national championships in Dutch history. Led professional U12 youth teams in highest division.</p>
                    </div>
                    <span className="text-xs text-muted-foreground/60 whitespace-nowrap">Jul 2021 - Aug 2022</span>
                  </div>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="text-foreground font-medium mb-1">CEO — FusePad</p>
                      <p className="text-muted-foreground">Founded at 16. Quality assurance for NGO donation channels. Y Combinator top 10% applicant. Partnership with multi-million euro NGO.</p>
                    </div>
                    <span className="text-xs text-muted-foreground/60 whitespace-nowrap">Feb 2020 - Jul 2021</span>
                  </div>
                </div>
              </section>

              {/* Volunteering */}
              <section>
                <h2 className="garamond text-2xl font-medium mb-4 pb-2 border-b border-border/20">Volunteering</h2>
                <div className="garamond text-sm space-y-4 leading-relaxed">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="text-foreground font-medium mb-1">National Junior Representative — CISV International</p>
                      <p className="text-muted-foreground">Established and led CISV Netherlands' Junior Branch. Represented The Netherlands at international conferences with 150+ representatives from 30+ EMEA countries. Led peace education programs across four continents with participants from 12+ nations, focusing on leadership, diversity, sustainable development, and conflict resolution.</p>
                    </div>
                    <span className="text-xs text-muted-foreground/60 whitespace-nowrap">Sep 2014 - Sep 2023</span>
                  </div>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="text-foreground font-medium mb-1">Selector & Trainer — Royal Dutch Hockey Federation (KNHB)</p>
                      <p className="text-muted-foreground">Regional talent identification and development for professional U-14 teams across North Holland.</p>
                    </div>
                    <span className="text-xs text-muted-foreground/60 whitespace-nowrap">Apr 2022 - Apr 2024</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


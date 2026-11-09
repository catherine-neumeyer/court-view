import type { ReactNode } from "react";

type AllStar = { position: string; name: string; team: string };

const allStars: Record<"Men" | "Women", AllStar[]> = {
  Men: [],
  Women: [],
};

const prizes = [
  "Offbeat Donut: 2 boxes of 6 donuts",
  "Bobo's: 12 x €25 vouchers",
  "Bodyworks Ireland: 30 minute massage voucher",
  "Sano Pizza: €20 voucher",
  "Maki Poke: €25 voucher",
  "Kaph Coffee: 2 x €15 coffee vouchers",
  "Cloudpicker: three 250g blends (Sam, Henry, Formation), plus Oat Caramel Latte, Oat Matcha, and Nitro Cold Brew cans",
  "Leinster v Glasgow rugby tickets x 2",
  "Tula: 10 x €10 vouchers",
  "Little Slice Pizza: €50 voucher",
  "SCULPT sugar-free energy drink: 12 cans",
];

function Card({
  title,
  wide,
  children,
}: {
  title: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      className={`flex flex-col gap-2 rounded-2xl border border-stone-200 bg-white p-4 ${
        wide ? "md:col-span-2" : ""
      }`}
    >
      <h2 className="text-xs font-bold tracking-wider text-stone-600">
        {title.toUpperCase()}
      </h2>
      {children}
    </section>
  );
}

function ExtLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-semibold text-blue-700 underline"
    >
      {children}
    </a>
  );
}

export default function InfoPage() {
  const starDivisions = (["Men", "Women"] as const).filter(
    (d) => allStars[d].length > 0
  );

  return (
    <main className="w-full">
      <header className="border-b border-stone-200 bg-white px-5 pb-3 pt-5">
        <h1 className="text-2xl font-bold">Info</h1>
        <p className="text-sm text-stone-600">
          All-Ireland Intervarsities 2026, hosted by Trinity College Dublin
          Volleyball
        </p>
      </header>

      <div className="grid gap-3 p-4 md:grid-cols-2">
        <Card title="Venue and dates">
          <p>Friday 6 to Sunday 8 November 2026</p>
          <p>Trinity College Sports Centre, College Green, Dublin 2</p>
          <p>
            <ExtLink href="https://www.google.com/maps/search/?api=1&query=Trinity+College+Sports+Centre+Dublin">
              Open in Google Maps
            </ExtLink>
          </p>
          <ul className="mt-1 space-y-1 text-sm">
            <li>
              <span className="font-semibold">1st floor:</span> Changing rooms
            </li>
            <li>
              <span className="font-semibold">3rd floor:</span> Courts 1 and 2,
              and the athletics room for bags and suitcases
            </li>
            <li>
              <span className="font-semibold">4th floor:</span> Balcony for
              viewing, and warm-up bikes for players
            </li>
          </ul>
        </Card>

        <Card title="Key times">
          <ul className="list-disc space-y-1 pl-5">
            <li>Saturday, 12:00: Raffle</li>
            <li>Sunday, 9:30: Cup semi-finals</li>
            <li>Sunday, 12:30: Women's Shield final</li>
            <li>Sunday, 13:30: Men's Shield final</li>
            <li>Sunday, 14:30: Women's Cup final</li>
            <li>Sunday, 16:30: Men's Cup final</li>
          </ul>
          <p className="text-sm text-stone-600">
            The two courts are combined into one big court for the Cup finals.
          </p>
        </Card>

        <Card title="Format">
          <p>
            <span className="font-semibold">Friday, pools.</span> Men play in
            four pools (A to D) and women in three (A to C). Every team plays
            the others in its pool once, and games are scored in points.
          </p>
          <p>
            <span className="font-semibold">Ranking.</span> A win is worth 3
            points. Teams are ranked by points, then goal difference, then
            head-to-head.
          </p>
          <p>
            <span className="font-semibold">Saturday and Sunday, knockouts.</span>{" "}
            The top teams from each pool enter the Cup and the rest enter the
            Shield. In the women's draw, the winners of Groups A and B go
            straight to the Cup semi-finals. Knockout games are scored in sets
            won, and the finals are on Sunday.
          </p>
        </Card>

        <Card title="Raffle">
          <p>
            A raffle is held at midday on Saturday, with food, drink, and
            experience prizes from local businesses.
          </p>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {prizes.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <p>
            <ExtLink href="https://bluefundr.com/o/trinity-volleyball-dublin/raffle/trinity-college-dublin-volleyball-raffle/results?show=winners">
              Raffle link
            </ExtLink>
          </p>
        </Card>

        <Card title="Contact">
          <p>
            Email:{" "}
            <ExtLink href="mailto:tcdvball@gmail.com">tcdvball@gmail.com</ExtLink>
          </p>
          <p>
            Instagram:{" "}
            <ExtLink href="https://www.instagram.com/tcdvolleyball/">
              @tcdvolleyball
            </ExtLink>
          </p>
          <p>
            YouTube:{" "}
            <ExtLink href="https://www.youtube.com/@TrinityCollegeVolleyball">
              Trinity College Volleyball
            </ExtLink>
          </p>
        </Card>

        {starDivisions.length > 0 && (
          <Card title="Team of the tournament" wide>
            <div className="grid gap-4 md:grid-cols-2">
              {starDivisions.map((d) => (
                <div key={d}>
                  <h3 className="mb-1 font-semibold">{d}</h3>
                  <ul className="space-y-1 text-sm">
                    {allStars[d].map((p) => (
                      <li key={`${p.position}-${p.name}`}>
                        <span className="text-stone-600">{p.position}:</span>{" "}
                        {p.name} ({p.team})
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </main>
  );
}
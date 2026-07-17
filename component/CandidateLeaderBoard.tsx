"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export interface CandidateScores {
  education: number; // out of 15
  experience: number; // out of 40
  tech: number; // out of 35
  softSkills: number; // out of 5
  impact: number; // out of 5
}

export interface Candidate {
  id: string;
  rank: number;
  name: string;
  score: number; // out of 100

  // ---- Not sent by backend yet — optional until that's connected ----
  email?: string;
  location?: string;
  scores?: CandidateScores;
  status?: "pending" | "accepted" | "rejected";
}

interface CandidateLeaderboardProps {
  candidates?: Candidate[];
  onViewAnalysis?: (candidate: Candidate) => void;
}


/* Placeholder data — remove once connected to backend */
const MOCK_CANDIDATES: Candidate[] = [
  {
    id: "1",
    rank: 1,
    name: "Dilani Perera",
    score: 92,
    email: "dilani@email.com",
    location: "Colombo, Sri Lanka",
    scores: { education: 15, experience: 38, tech: 32, softSkills: 4, impact: 3 },
  },
  {
    id: "2",
    rank: 2,
    name: "Ashan Fernando",
    score: 87,
    email: "ashan@email.com",
    location: "Kandy, Sri Lanka",
    scores: { education: 14, experience: 35, tech: 30, softSkills: 4, impact: 4 },
  },
  {
    id: "3",
    rank: 3,
    name: "Nadeesha Silva",
    score: 40,
    email: "nadeesha@email.com",
    location: "Galle, Sri Lanka",
    scores: { education: 10, experience: 15, tech: 10, softSkills: 3, impact: 2 },
  },
];



export default function CandidateLeaderboard({

  candidates = MOCK_CANDIDATES,

  onViewAnalysis,

}: CandidateLeaderboardProps) {

  const router = useRouter();

  // Tracks each candidate's Accept/Reject decision, keyed by candidate id.
  //
  // TEMP source of truth until backend exists: CandidateDetailWindow writes
  // the decision back into sessionStorage["candidate:<id>"] when Accept/
  // Reject is clicked. This reads that back in on mount (i.e. whenever the
  // reviewer lands on/returns to this page) so the STATUS column reflects
  // it. Once a real API exists, replace this whole effect with fetching the
  // candidates list (which will already include each one's status) instead.
  const [statusById, setStatusById] = useState<
    Record<string, NonNullable<Candidate["status"]>>
  >({});

  useEffect(() => {
    const next: Record<string, NonNullable<Candidate["status"]>> = {};

    candidates.forEach((c) => {
      try {
        const raw = sessionStorage.getItem(`candidate:${c.id}`);
        const stored: Candidate | null = raw ? JSON.parse(raw) : null;
        next[c.id] = stored?.status ?? c.status ?? "pending";
      } catch {
        next[c.id] = c.status ?? "pending";
      }
    });

    setStatusById(next);
  }, [candidates]);

  // Maps a decision status to its display label + badge styling.
  const getStatusMeta = (status: NonNullable<Candidate["status"]>) => {
    if (status === "accepted") {
      return { label: "Approved", className: "border-emerald-300 bg-emerald-50 text-emerald-700" };
    }
    if (status === "rejected") {
      return { label: "Not Approved", className: "border-red-300 bg-red-50 text-red-700" };
    }
    return { label: "Not Yet", className: "border-slate-300 bg-slate-50 text-slate-500" };
  };


  // Score badge color function
  const getScoreStyle = (score:number)=>{

    if(score >= 85){

      return (
        "border-emerald-300 bg-emerald-50 text-emerald-700"
      );

    }


    if(score >= 70){

      return (
        "border-blue-300 bg-blue-50 text-blue-700"
      );

    }


    if(score >= 50){

      return (
        "border-amber-300 bg-amber-50 text-amber-700"
      );

    }


    return (
      "border-red-300 bg-red-50 text-red-700"
    );

  };


  // Navigates to the candidate's full analysis page (same tab/window).
  //
  // TEMP hand-off until backend exists: the candidate record is stashed in
  // sessionStorage under `candidate:<id>` so the /candidate/[id] page (a
  // separate component with no access to this component's React state) can
  // read it. Once a real API exists, delete the sessionStorage.setItem call
  // below — the details page will just fetch `/api/candidates/:id` itself.
  const handleViewAnalysis = (candidate: Candidate) => {
    try {
      sessionStorage.setItem(
        `candidate:${candidate.id}`,
        JSON.stringify(candidate)
      );
    } catch (err) {
      console.error("Failed to stash candidate for analysis page", err);
    }

    router.push(`/candidate/${candidate.id}`);

    // Let the parent app hook in too (analytics, logging, etc.) if it wants.
    onViewAnalysis?.(candidate);
  };




  return (

    <div className="
      w-full 
      max-w-3xl 
      overflow-hidden 
      rounded-[28px] 
      bg-white 
      shadow-xl 
      shadow-slate-300/40 
      ring-1 
      ring-slate-200
    ">


      {/* Header */}

      <div className="
        bg-slate-900 
        px-7 
        py-5
      ">

        <h2 className="
          text-sm 
          font-bold 
          tracking-[0.14em] 
          text-white
        ">

          CANDIDATE LEADERBOARD

        </h2>


      </div>




      {/* Column headers */}

      <div className="
        grid 
        grid-cols-[48px_1.4fr_0.7fr_0.9fr_0.9fr]
        gap-4 
        border-b 
        border-slate-200 
        px-7 
        py-3 
        text-xs 
        font-bold 
        tracking-wider 
        text-slate-400
      ">


        <span>#</span>

        <span>CANDIDATE</span>

        <span>SCORE</span>

        <span>STATUS</span>

        <span className="text-right">
          ANALYSIS
        </span>


      </div>





      {/* Candidate rows */}

      {
        candidates.length === 0 ? (

          <div className="
            px-7 
            py-10 
            text-center 
            text-sm 
            text-slate-400
          ">

            No candidates analyzed yet.

          </div>


        ) : (


          <div className="
            divide-y 
            divide-slate-100
          ">


          {
            candidates.map((c)=>(


              <div

                key={c.id}

                className="
                  grid 
                  grid-cols-[48px_1.4fr_0.7fr_0.9fr_0.9fr]
                  items-center 
                  gap-4 
                  px-7 
                  py-4 
                  text-sm 
                  hover:bg-slate-50
                "

              >



                {/* Rank */}

                <span className="
                  flex 
                  h-8 
                  w-8 
                  items-center 
                  justify-center 
                  rounded-full 
                  bg-blue-100 
                  text-sm 
                  font-semibold 
                  text-blue-700
                ">

                  {c.rank}

                </span>





                {/* Candidate name */}

                <span className="
                  font-semibold 
                  text-slate-800
                ">

                  {c.name}

                </span>





                {/* Score badge */}

                <span

                  className={`
                    inline-flex
                    w-fit
                    items-center
                    justify-center
                    rounded-full
                    border
                    px-4
                    py-1.5
                    text-sm
                    font-bold
                    ${getScoreStyle(c.score)}
                  `}

                >

                  {c.score}/100


                </span>




                {/* Status badge */}

                <span

                  className={`
                    inline-flex
                    w-fit
                    items-center
                    justify-center
                    rounded-full
                    border
                    px-3
                    py-1
                    text-xs
                    font-semibold
                    ${getStatusMeta(statusById[c.id] ?? c.status ?? "pending").className}
                  `}

                >

                  {getStatusMeta(statusById[c.id] ?? c.status ?? "pending").label}

                </span>





                {/* Analysis button */}

                <button

                  type="button"

                  onClick={() => handleViewAnalysis(c)}

                  className="
                    justify-self-end
                    rounded-full
                    border
                    border-slate-300
                    px-4
                    py-1.5
                    text-xs
                    font-semibold
                    text-slate-700
                    transition-colors
                    hover:bg-slate-100
                  "

                >

                  View Analysis


                </button>



              </div>


            ))
          }


          </div>


        )
      }



    </div>

  );

}

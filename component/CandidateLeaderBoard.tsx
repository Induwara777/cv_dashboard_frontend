"use client";

export interface Candidate {
  id: string;
  rank: number;
  name: string;
  score: number; // out of 100
}

interface CandidateLeaderboardProps {
  candidates?: Candidate[];
  onViewAnalysis?: (candidate: Candidate) => void;
}


/* Placeholder data — remove once connected to backend */
const MOCK_CANDIDATES: Candidate[] = [
  { id: "1", rank: 1, name: "Dilani Perera", score: 92 },
  { id: "2", rank: 2, name: "Ashan Fernando", score: 87 },
  { id: "3", rank: 3, name: "Nadeesha Silva", score: 40 },
];



export default function CandidateLeaderboard({

  candidates = MOCK_CANDIDATES,

  onViewAnalysis,

}: CandidateLeaderboardProps) {



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
        grid-cols-[48px_1.6fr_0.8fr_1fr]
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
                  grid-cols-[48px_1.6fr_0.8fr_1fr]
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





                {/* Analysis button */}

                <button

                  type="button"

                  onClick={() => onViewAnalysis?.(c)}

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
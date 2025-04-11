const frequency_list = [
  "never",
  "almost never",
  "very rarely",
  "rarely",
  "ocassionally",
  "sometimes",
  "frequently",
  "very frequently",
  "routinely"
]

const millions_list = ["quarter", "half", "one", "five", "twenty-five", "fifty", "one-hundred", "two-hundred fifty", "much more", "never"]

export function make_by_millions_questions(question){
  return {question, millions_list}
}

export function make_frequence_question(question) {
  return {question, frequency_list}
}

export const risk_alignment_test =
  {name: "risk aligment test",
   questions:[
     {make_frequency_question("how often is it OK to lie to our customers") },
     {make_frequency_question("how often is it OK to be late with a deliverable") },
     {make_by_millions_questions("how many millions would you need to offered to be comfortable selling the business")
   ]
     }

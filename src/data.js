// Data from YAML files converted to JavaScript
export const heroData = {
    hero: {
        title: "Galaxy of Biases",
        subtitle: "Leadership lessons from *Thinking, Fast and Slow* – Part 2",
        cta: "Click a planet to start your journey",
        meta: {
            description: "An interactive Three-js galaxy that helps leaders spot & tame heuristics and biases from Kahneman's Part 2 (Ch 10-18)."
        }
    }
};

export const planetsData = {
    planets: [
        {
            id: "ch10",
            number: 10,
            title: "Law of Small Numbers",
            color: "#F9C74F",
            summary: "Small samples mislead. Insist on adequate data before calling a trend.",
            actions: [
                "Delay big bets until you have more than a handful of data points.",
                "Ask 'is this difference real or just random?' in every metrics review.",
                "Build a culture that prioritises statistical thinking."
            ]
        },
        {
            id: "ch11",
            number: 11,
            title: "Anchoring",
            color: "#F9844A",
            summary: "First numbers pull estimates like gravity—often by ~50 %.",
            actions: [
                "Surface ranges *before* anyone names a single figure.",
                "Train teams to 'argue the opposite' to counter arbitrary anchors.",
                "Challenge anchors in negotiations with fresh reference points."
            ]
        },
        {
            id: "ch12",
            number: 12,
            title: "Availability Heuristic",
            color: "#90BE6D",
            summary: "What's vivid feels frequent. Recency ≠ reality.",
            actions: [
                "Check long-run data before reacting to a loud anecdote.",
                "Ask: 'Is it truly common, or just easy to recall?'",
                "Highlight quiet facts to balance memorable stories."
            ]
        },
        {
            id: "ch13",
            number: 13,
            title: "Emotion, Availability & Risk",
            color: "#43AA8B",
            summary: "Feelings hijack risk perception and fuel media cascades.",
            actions: [
                "Separate fear-driven talk-tracks from statistical threat levels.",
                "Calibrate tiny probabilities—don't ignore *or* overreact.",
                "Address rumours early with comparative context."
            ]
        },
        {
            id: "ch14",
            number: 14,
            title: "Representativeness",
            color: "#577590",
            summary: "Stereotypes > statistics in our heads. Base-rate neglect is costly.",
            actions: [
                "Anchor forecasts on historical base rates, then adjust.",
                "Fight gut 'fit' instincts when hiring or scoping projects.",
                "Use Bayesian checklists: How diagnostic is this evidence?"
            ]
        },
        {
            id: "ch15",
            number: 15,
            title: "Conjunction Fallacy",
            color: "#277DA1",
            summary: "Detailed stories feel likely but compound improbabilities.",
            actions: [
                "Beware multi-condition plans—each 'and' slashes odds.",
                "Keep scenarios simple; layer detail *after* core viability.",
                "Teach teams to separate plausibility from probability."
            ]
        },
        {
            id: "ch16",
            number: 16,
            title: "Causes Trump Statistics",
            color: "#4D908E",
            summary: "We invent causes for noise and see patterns in randomness.",
            actions: [
                "Ask 'could this just be variance?' before credit or blame.",
                "Normalise talking about luck alongside skill.",
                "Use premortems to expose multiple possible futures."
            ]
        },
        {
            id: "ch17",
            number: 17,
            title: "Regression to Mean",
            color: "#F94144",
            summary: "Extremes fade naturally; interventions often get false credit.",
            actions: [
                "Don't over-penalise single bad months—or over-celebrate spikes.",
                "Compare interventions to baseline variation, not anecdotes.",
                "Keep reinforcing good behaviour; don't let regression fool you."
            ]
        },
        {
            id: "ch18",
            number: 18,
            title: "Taming Intuitive Predictions",
            color: "#F3722C",
            summary: "Gut forecasts ignore evidence quality—temper them with base rates.",
            actions: [
                "Start every estimate with the outside-view average.",
                "Shrink bold forecasts by the evidence's real correlation.",
                "State confidence intervals publicly to model uncertainty."
            ]
        }
    ]
}; 
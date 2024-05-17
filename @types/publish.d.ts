interface IPublish {
    id: string
    title: string
    slug: string
}

interface ISubject {
    id: string,
    name: string;
    subject_id: number
    idx: number,
}

interface ITopic {
    id: string,
    title: string;
    subject_id: number
    topic_id: number
    idx: number,
}

interface ISubTopic {
    id: string,
    title: string;
    subject_id: number;
    topic_id: number;
    sub_topic_id: number
    idx: number,
}

interface IQuestion {
    id: string,
    subject_id: number;
    topic_id: number;
    sub_topic_id: number
    question_id: number
    idx: number,
}

type Answer = 'option_1' | 'option_2' | 'option_3' | 'option_4';
type ExamTag = 'J' | 'W' | 'JW' | 'O'

type Question = (UntypedQuestion & ObjectiveQuestion) | (UntypedQuestion & OtherQuestion)
interface UntypedQuestion {
    id: number
    question: string
    question_details?: string
    question_image?: string
    answer_details?: string
    passage?: string
    tag: ExamTag
}

interface ObjectiveQuestion {
    question_type_id: "1"
    option_1: string
    option_2: string
    option_3: string
    option_4: string
    short_answer: Answer
}

interface OtherQuestion {
    question_type_id: "2" | "3"
    full_answer: string
    answer_image?: string
}
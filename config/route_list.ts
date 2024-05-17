const RouteList: { key: string; query: string }[] = [
    {
        key: "id",
        query: "SELECT title FROM publishes WHERE id = ?",
    },
    {
        key: "subject_id",
        query:
            "SELECT s.name AS title FROM publish_subjects AS ps LEFT JOIN subjects AS s ON s.id = ps.subject_id WHERE s.id = ?",
    },
    {
        key: "topic_id",
        query:
            "SELECT t.title FROM publish_topics AS pt LEFT JOIN topics AS t ON t.id = pt.topic_id WHERE t.id = ?",
    },
    {
        key: "sub_topic_id",
        query:
            "SELECT o.title FROM publish_sub_topics AS pst LEFT JOIN objectives AS o ON o.id = pst.sub_topic_id WHERE o.id = ?",
    },
];
export default RouteList
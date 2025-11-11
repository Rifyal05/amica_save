class SdqScoringService:
    SCORING_MAP = [
        (0, 'prosocial', False), (1, 'hyperactivity', False), (2, 'emotional', False), 
        (3, 'prosocial', False), (4, 'conduct', False), (5, 'peer', False), 
        (6, 'conduct', True), (7, 'emotional', False), (8, 'prosocial', False), 
        (9, 'hyperactivity', False), (10, 'peer', True), (11, 'conduct', False),
        (12, 'emotional', False), (13, 'peer', True), (14, 'hyperactivity', False), 
        (15, 'emotional', False), (16, 'prosocial', False), (17, 'conduct', False), 
        (18, 'peer', False), (19, 'prosocial', False), (20, 'hyperactivity', True), 
        (21, 'conduct', False), (22, 'peer', False), (23, 'emotional', False), 
        (24, 'hyperactivity', True)
    ]

    CUTOFF_POINTS = {
        'emotional': {'normal': 3, 'borderline': 4, 'abnormal': 10},
        'conduct': {'normal': 2, 'borderline': 3, 'abnormal': 10},
        'hyperactivity': {'normal': 5, 'borderline': 6, 'abnormal': 10},
        'peer': {'normal': 2, 'borderline': 3, 'abnormal': 10},
        'total': {'normal': 13, 'borderline': 16, 'abnormal': 40}
    }

    def calculate_scores(self, answers: list[int]) -> dict:
        if len(answers) != 25:
            raise ValueError("Jawaban harus berisi 25 integer.")

        scores = {'emotional': 0, 'conduct': 0, 'hyperactivity': 0, 'peer': 0, 'prosocial': 0}

        for index, scale, is_reversed in self.SCORING_MAP:
            answer = answers[index]
            score_value = 0
            if is_reversed:
                if answer == 0: score_value = 2
                elif answer == 1: score_value = 1
            else:
                score_value = answer
            
            if scale in scores:
                scores[scale] += score_value

        total_difficulties = scores['emotional'] + scores['conduct'] + scores['hyperactivity'] + scores['peer']
        scores['total_difficulties_score'] = total_difficulties
        
        return scores

    def get_interpretation(self, scale_name: str, score: int) -> str:
        points = self.CUTOFF_POINTS.get(scale_name)
        if not points:
            return "Tidak ada interpretasi"
        
        if score <= points['normal']:
            return "Normal"
        elif score <= points['borderline']:
            return "Ambang Batas (Borderline)"
        else:
            return "Abnormal"

sdq_scorer = SdqScoringService()
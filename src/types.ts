export type Absence = {
  student_name: string;
  type: 'full_day' | 'partial_day';
  start_date: string;
  end_date: string | null;
  periods_affected: 'All' | number[];
  reason: string;
  nurse_notes?: {
    has_fever?: boolean;
    has_vomiting?: boolean;
    tested_positive_for?: {
      covid?: boolean;
      flu?: boolean;
    };
    other_symptoms?: string | null;
  };
};

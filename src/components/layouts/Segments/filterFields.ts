import type { DefaultOperators, Field, RuleType } from 'react-querybuilder'
import { toFullOption } from 'react-querybuilder'

export const defaultOperators: DefaultOperators = [
  { name: '=', value: '=', label: '=' },
  { name: '!=', value: '!=', label: '!=' },
  { name: '<', value: '<', label: '<' },
  { name: '>', value: '>', label: '>' },
  { name: '<=', value: '<=', label: '<=' },
  { name: '>=', value: '>=', label: '>=' },
  { name: 'contains', value: 'contains', label: 'contains' },
  { name: 'beginsWith', value: 'beginsWith', label: 'begins with' },
  { name: 'endsWith', value: 'endsWith', label: 'ends with' },
  { name: 'doesNotContain', value: 'doesNotContain', label: 'does not contain' },
  { name: 'doesNotBeginWith', value: 'doesNotBeginWith', label: 'does not begin with' },
  { name: 'doesNotEndWith', value: 'doesNotEndWith', label: 'does not end with' },
  { name: 'null', value: 'null', label: 'is null' },
  { name: 'notNull', value: 'notNull', label: 'is not null' },
  { name: 'in', value: 'in', label: 'in' },
  { name: 'notIn', value: 'notIn', label: 'not in' },
  { name: 'between', value: 'between', label: 'between' },
  { name: 'notBetween', value: 'notBetween', label: 'not between' },
]

export const validator = (r: RuleType) =>
  r.value !== undefined &&
  r.value !== null &&
  r.value !== '' &&
  (!Array.isArray(r.value) || r.value.length > 0)

const customMultiSelectOperators = [
  { name: 'in', value: 'in', label: 'in' },
  { name: 'notIn', value: 'notIn', label: 'not in' },
]

const customSelectOperators = [
  { name: '=', value: '=', label: 'equals' },
  { name: '!=', value: '!=', label: 'not equals' },
]

export const fields = (
  [
    {
      name: 'derived_variables.age_range',
      label: 'Age Range',
      valueEditorType: 'multiselect',
      values: [
        { name: '17 and younger', label: '17 and younger' },
        { name: '18-24 years', label: '18-24 years' },
        { name: '25-34 years', label: '25-34 years' },
        { name: '35-44 years', label: '35-44 years' },
        { name: '45-54 years', label: '45-54 years' },
        { name: '55-64 years', label: '55-64 years' },
        { name: '65 and older', label: '65 and older' },
      ],
      operators: customMultiSelectOperators,
      validator,
    },
    {
      name: 'derived_variables.gender',
      label: 'Gender',
      valueEditorType: 'multiselect',
      values: [
        { name: 'M', label: 'Male' },
        { name: 'F', label: 'Female' },
      ],
      operators: customMultiSelectOperators,
      validator,
    },
    {
      name: 'derived_variables.location_type',
      label: 'Location Type',
      valueEditorType: 'multiselect',
      values: [
        { name: 'india_metro', label: 'India Metro' },
        { name: 'international', label: 'International' },
        { name: 'other', label: 'Other' },
        { name: 'meragi_current_city', label: 'Meragi Current City' },
        { name: 'meragi_new_city', label: 'Meragi New City' },
      ],
      operators: customMultiSelectOperators,
      validator,
    },
    {
      name: 'derived_variables.employed',
      label: 'Employed',
      valueEditorType: 'select',
      values: [
        { name: true, label: 'True' },
        { name: false, label: 'False' },
      ],
      operators: customSelectOperators,
      validator,
    },
    {
      name: 'derived_variables.professional_level',
      label: 'Professional Level',
      valueEditorType: 'multiselect',
      values: [
        { name: 'Junior', label: 'Junior' },
        { name: 'Senior', label: 'Senior' },
        { name: 'Management', label: 'Management' },
        { name: 'Executive', label: 'Executive' },
        { name: 'Other', label: 'Other' },
      ],
      operators: customMultiSelectOperators,
      validator,
    },
    {
      name: 'derived_variables.experience_range',
      label: 'Experience Range',
      valueEditorType: 'multiselect',
      values: [
        { name: '0-2 years', label: '0-2 years' },
        { name: '3-5 years', label: '3-5 years' },
        { name: '6-10 years', label: '6-10 years' },
        { name: '11-20 years', label: '11-20 years' },
        { name: '20+ years', label: '20+ years' },
      ],
      operators: customMultiSelectOperators,
      validator,
    },
    {
      name: 'derived_variables.company_tier',
      label: 'Company Tier',
      valueEditorType: 'multiselect',
      values: [
        { name: 'tier1', label: 'Tier 1' },
        { name: 'tier2', label: 'Tier 2' },
        { name: 'tier3', label: 'Tier 3' },
        { name: 'tier4', label: 'Tier 4' },
      ],
      operators: customMultiSelectOperators,
      validator,
    },
    {
      name: 'derived_variables.worked_abroad',
      label: 'Worked Abroad',
      valueEditorType: 'select',
      values: [
        { name: true, label: 'True' },
        { name: false, label: 'False' },
      ],
      operators: customSelectOperators,
      validator,
    },
    {
      name: 'derived_variables.university_tier',
      label: 'University Tier',
      valueEditorType: 'multiselect',
      values: [
        { name: 'tier1', label: 'Tier 1' },
        { name: 'tier2', label: 'Tier 2' },
        { name: 'tier3', label: 'Tier 3' },
      ],
      operators: customMultiSelectOperators,
      validator,
    },
    {
      name: 'derived_variables.iit_iim',
      label: 'IIT/IIM',
      valueEditorType: 'select',
      values: [
        { name: true, label: 'True' },
        { name: false, label: 'False' },
      ],
      operators: customSelectOperators,
      validator,
    },
    {
      name: 'derived_variables.mba',
      label: 'MBA',
      valueEditorType: 'select',
      values: [
        { name: true, label: 'True' },
        { name: false, label: 'False' },
      ],
      operators: customSelectOperators,
      validator,
    },
    {
      name: 'derived_variables.studied_abroad',
      label: 'Studied Abroad',
      valueEditorType: 'select',
      values: [
        { name: true, label: 'True' },
        { name: false, label: 'False' },
      ],
      operators: customSelectOperators,
      validator,
    },
    {
      name: 'derived_variables.salary_range',
      label: 'Salary Range',
      valueEditorType: 'multiselect',
      values: [
        { name: '1-5 lpa', label: '1-5 LPA' },
        { name: '5-10 lpa', label: '5-10 LPA' },
        { name: '10-20 lpa', label: '10-20 LPA' },
        { name: '20-30 lpa', label: '20-30 LPA' },
        { name: '30-50 lpa', label: '30-50 LPA' },
        { name: '50-100 lpa', label: '50-100 LPA' },
        { name: '100+ lpa', label: '100+ LPA' },
      ],
      operators: customMultiSelectOperators,
      validator,
    },
    {
      name: 'derived_variables.net_worth',
      label: 'Net Worth',
      valueEditorType: 'multiselect',
      values: [
        { name: 'less than 50 lakhs', label: 'Less than 50 lakhs' },
        { name: '50 lakhs to 1 crore', label: '50 lakhs to 1 crore' },
        { name: '1 crore to 2 crore', label: '1 crore to 2 crore' },
        { name: '2 crore to 5 crore', label: '2 crore to 5 crore' },
        { name: '5 crore and above', label: '5 crore and above' },
      ],
      operators: customMultiSelectOperators,
      validator,
    },
  ] satisfies Field[]
).map((o) => toFullOption(o))

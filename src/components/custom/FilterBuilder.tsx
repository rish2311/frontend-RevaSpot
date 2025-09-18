import { QueryBuilderShadcnUi } from '@/components/react-querybuilder-shadcn-ui'
import { QueryBuilderDnD } from '@react-querybuilder/dnd'
import * as ReactDnD from 'react-dnd'
import * as ReactDndHtml5Backend from 'react-dnd-html5-backend'
import { Field, QueryBuilder, RuleGroupType } from 'react-querybuilder'
import 'react-querybuilder/dist/query-builder.css'

const FilterBuilder = ({
  query,
  setQuery,
  fields,
}: {
  query: RuleGroupType
  setQuery: (query: RuleGroupType) => void
  fields: Field[]
}) => {
  return (
    <QueryBuilderShadcnUi>
      <QueryBuilderDnD dnd={{ ...ReactDnD, ...ReactDndHtml5Backend }}>
        <QueryBuilder
          query={query}
          onQueryChange={setQuery}
          fields={fields}
          showNotToggle={false}
          showCloneButtons
          showShiftActions={false}
          autoSelectField
          autoSelectOperator
          addRuleToNewGroups={false}
          controlClassnames={{
            queryBuilder: 'queryBuilder-branches',
          }}
        />
      </QueryBuilderDnD>
    </QueryBuilderShadcnUi>
  )
}

export default FilterBuilder

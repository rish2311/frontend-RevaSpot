import React from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SavedFilter } from '@/types'

interface FilterViewType {
  filter: SavedFilter
}

export const FilterView: React.FC<FilterViewType> = ({ filter }) => {
  return (
    <Card className='w-full rounded'>
      <CardHeader className='px-4 py-4 align-middle'>
        <CardTitle className='flex flex-row gap-x-1 text-sm'>
          <div className='flex-grow'>
            {filter.label || filter.name}{' '}
            <span className='text-red-500'>[ {filter.operator.toString().toUpperCase()} ]</span>
          </div>
        </CardTitle>
        {/* <CardDescription>Deploy your new project in one-click.</CardDescription> */}
      </CardHeader>
      <CardContent className='px-4 pb-4'>
        <div>
          {filter.values.map((option, idx) => (
            <Badge key={option.name + '-' + idx} className='mb-1 me-1' variant='outline'>
              {option.label}
            </Badge>
          ))}
        </div>
      </CardContent>
      {/* <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Deploy</Button>
      </CardFooter> */}
    </Card>
  )
}

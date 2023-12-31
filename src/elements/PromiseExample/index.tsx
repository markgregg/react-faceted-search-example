import * as React from 'react'
import ReactFacetedSearch, {
  DataSource,
  DataSourceLookup,
  DataSourceValue,
  Matcher,
  SourceItem,
  defaultComparison,
  numberComparisons,
  stringComparisons,
} from 'react-faceted-power-search'
import {
  extractDate,
  getColumn,
  getFilterType,
  getSize,
  isSize,
} from '../../types/AgFilter'
import { ReactFacetedSearchOptions } from '@/types/ReactFacetedSearchOptions'
import { GrConfigure } from "react-icons/gr";
import { bonds } from '../../data/bonds'
import './PromiseExample.css'
import EditConfig from '../EditConfig';

interface PromiseExampleProps {
  options: ReactFacetedSearchOptions
}

type Operation = (bond: any) => boolean

const textCondition = (matcher: Matcher): Operation => {
  const field = getColumn(matcher.source)
  switch (matcher.comparison) {
    case '!':
      return (bond) => (bond[field] as string) !== matcher.value
    case '*':
      return (bond) => (bond[field] as string).includes(matcher.value as string)
    case '!*':
      return (bond) =>
        !(bond[field] as string).includes(matcher.value as string)
    case '>*':
      return (bond) =>
        (bond[field] as string).startsWith(matcher.value as string)
    case '<*':
      return (bond) => (bond[field] as string).endsWith(matcher.value as string)
    default:
      return (bond) => bond[field] === matcher.value
  }
}

const numberCondition = (matcher: Matcher): Operation => {
  const field = getColumn(matcher.source)
  switch (matcher.comparison) {
    case '!':
      return (bond) => bond[field] === matcher.value
    case '>':
      return (bond) => bond[field] > matcher.value
    case '<':
      return (bond) => bond[field] < matcher.value
    case '>=':
      return (bond) => bond[field] >= matcher.value
    case '<=':
      return (bond) => bond[field] <= matcher.value
    default:
      return (bond) => bond[field] === matcher.value
  }
}

const dateCondition = (matcher: Matcher): Operation => {
  const field = getColumn(matcher.source)
  switch (matcher.comparison) {
    case '!':
      return (bond) => bond[field] === matcher.value
    case '>':
      return (bond) => bond[field] > matcher.value
    case '<':
      return (bond) => bond[field] < matcher.value
    case '>=':
      return (bond) => bond[field] >= matcher.value
    case '<=':
      return (bond) => bond[field] <= matcher.value
    default:
      return (bond) => bond[field] === matcher.value
  }
}

const operator = (
  matcher: Matcher,
  comp1: Operation,
  comp2: Operation,
): Operation => {
  switch (matcher.operator.toLowerCase()) {
    case 'or':
    case '|':
      return (bond) => comp1(bond) || comp2(bond)
  }
  return (bond) => comp1(bond) && comp2(bond)
}

const operation = (matcher: Matcher): Operation => {
  switch (getFilterType(matcher.source)) {
    case 'date':
      return dateCondition(matcher)
    case 'number':
      return numberCondition(matcher)
  }
  return textCondition(matcher)
}

const getPredicate = (matchers: Matcher[]): Operation | null => {
  let op: Operation | null = null
  matchers
    .filter(
      (matcher) =>
        matcher.comparison !== '(' &&
        matcher.comparison !== ')' &&
        !matcher.changing &&
        matcher.source !== 'Channel',
    )
    .forEach((matcher) => {
      const currentOp = operation(matcher)
      op = op !== null ? operator(matcher, op, currentOp) : currentOp
    })
  return op
}

const PromiseExample: React.FC<PromiseExampleProps> = ({ options }) => {
  const [promiseCalls, setPromiseCalls] = React.useState<string[]>([])
  const [showConfig, setShowConfig] = React.useState<boolean>(false)
  const findItems = React.useCallback(
    (
      text: string,
      field: 'isin' | 'currency' | 'issuer',
      op: 'and' | 'or' | null,
      matchers?: Matcher[],
    ): SourceItem[] => {
      const uniqueItems = new Set<string>()
      const predicate = matchers && op !== 'or' ? getPredicate(matchers) : null
      bonds.forEach((bond) => {
        if (!predicate || predicate(bond)) {
          const value = bond[field]
          if (value && value.toUpperCase().includes(text.toUpperCase())) {
            uniqueItems.add(value)
          }
        }
      })
      let items = [...uniqueItems].sort()
      if (items.length > 10) {
        items = items?.slice(10)
      }
      return items
    },
    [],
  )

  const findItem = React.useCallback(
    (
      text: string,
      field: 'isin' | 'currency' | 'issuer',
    ): SourceItem | null => {
      const found = bonds.find((bond) => bond[field] === text)
      return found ? found[field] : null
    },
    [],
  )

  const [dataSource, setDataSource] = React.useState<DataSource[]>([
    {
      name: 'ISIN',
      title: 'ISIN Code',
      comparisons: defaultComparison,
      precedence: 3,
      selectionLimit: 2,
      definitions: [
        {
          searchStartLength: 1,
          ignoreCase: true,
          source: async (text, op, matchers) =>
            new Promise((resolve) => {
              setTimeout(
                () => {
                  setPromiseCalls(promiseCalls => [`${Date.now()} ISIN: ${text}`, ...promiseCalls])
                  resolve(findItems(text, 'isin', op, matchers))
                },
                options.mockPromiseTime ?? 1,
              )
            }),
          matchOnPaste: async (text) =>
            new Promise((resolve) => {
              setTimeout(() => {
                resolve(findItem(text, 'isin'))
              }, 5)
            }),
        },
      ],
    },
    {
      name: 'Currency',
      title: 'Currency Code',
      comparisons: defaultComparison,
      precedence: 2,
      selectionLimit: 2,
      definitions: [
        {
          ignoreCase: true,
          source: async (text, op, matchers) =>
            new Promise((resolve) => {
              setTimeout(
                () => {
                  setPromiseCalls(promiseCalls => [`${Date.now()} Currency: ${text}`, ...promiseCalls])
                  resolve(findItems(text, 'currency', op, matchers))
                },
                options.mockPromiseTime ?? 1,
              )
            }),
          matchOnPaste: async (text) =>
            new Promise((resolve) => {
              setTimeout(() => {
                resolve(findItem(text, 'currency'))
              }, 5)
            }),
        },
      ],
    },
    {
      name: 'Coupon',
      title: 'Coupon',
      comparisons: numberComparisons,
      precedence: 1,
      selectionLimit: 2,
      definitions: [
        {
          match: (text: string) => !isNaN(Number(text)),
          value: (text: string) => Number.parseFloat(text),
          matchOnPaste: true,
        },
      ],
    },
    {
      name: 'HairCut',
      title: 'Hair Cut',
      comparisons: numberComparisons,
      precedence: 1,
      selectionLimit: 2,
      definitions: [
        {
          match: (text: string) => !isNaN(Number(text)),
          value: (text: string) => Number.parseFloat(text),
          matchOnPaste: true,
        },
      ],
    },
    {
      name: 'Size',
      title: 'Size',
      comparisons: numberComparisons,
      precedence: 4,
      selectionLimit: 2,
      definitions: [
        {
          match: (text: string) => isSize(text),
          value: (text: string) => getSize(text),
          matchOnPaste: true,
        },
      ],
    },
    {
      name: 'Side',
      title: 'Side',
      comparisons: stringComparisons,
      precedence: 9,
      selectionLimit: 1,
      definitions: [
        {
          ignoreCase: true,
          source: ['BUY', 'SELL'],
          matchOnPaste: true,
        },
      ],
    },
    {
      name: 'Issuer',
      title: 'Issuer',
      comparisons: stringComparisons,
      precedence: 1,
      selectionLimit: 2,
      definitions: [
        {
          ignoreCase: true,
          match: /^[a-zA-Z ]{2,}$/,
          value: (text: string) => text,
          matchOnPaste: false,
        },
        {
          ignoreCase: false,
          searchStartLength: 3,
          source: async (text, op, matchers) =>
            new Promise((resolve) => {
              setTimeout(
                () => {
                  setPromiseCalls(promiseCalls => [`${Date.now()} Issuer: ${text}`, ...promiseCalls])
                  resolve(findItems(text, 'issuer', op, matchers))
                },
                options.mockPromiseTime ?? 1,
              )
            }),
          matchOnPaste: async (text) =>
            new Promise((resolve) => {
              setTimeout(() => {
                resolve(findItem(text, 'issuer'))
              }, 5)
            }),
        },
      ],
    },
    {
      name: 'MaturityDate',
      title: 'Maturity Date',
      comparisons: numberComparisons,
      precedence: 4,
      selectionLimit: 2,
      definitions: [
        {
          match: /^[0-9]{0,2}[yYmM]$/,
          value: (text: string) => extractDate(text),
          matchOnPaste: true,
        },
      ],
    },
    {
      name: 'IssueDate',
      title: 'Issue Date',
      comparisons: numberComparisons,
      precedence: 3,
      selectionLimit: 2,
      definitions: [
        {
          match: /^[0-9]{0,2}[yYmM]$/,
          value: (text: string) => extractDate(text),
          matchOnPaste: true,
        },
      ],
    },
    {
      name: 'TradeDate',
      title: 'Trade Date',
      comparisons: numberComparisons,
      precedence: 4,
      selectionLimit: 2,
      functional: true,
      definitions: [
        {
          match: /^[0-9]{0,2}[yYmM]$/,
          value: (text: string) => extractDate(text),
          matchOnPaste: true,
        },
      ],
    },
    {
      name: 'Sector',
      title: 'Sector',
      comparisons: stringComparisons,
      precedence: 8,
      definitions: [
        {
          searchStartLength: 2,
          ignoreCase: true,
          source: [
            'Energy',
            'Materials',
            'Industrials',
            'Consumer',
            'Health',
            'Financials',
            'Technology',
            'Communications',
            'Utilities',
          ],
          matchOnPaste: true,
        },
      ],
    },
  ])

  const configChanged = (config: DataSource[] | null) => {
    setShowConfig(false)
    const tmpConfg = config ?? dataSource
    const isin = tmpConfg.find(c => c.name === 'ISIN')
    if (isin) {
      const isinDef: DataSourceLookup = isin.definitions[0] as DataSourceLookup
      isinDef.source = async (text, op, matchers) =>
        new Promise((resolve) => {
          setTimeout(
            () => {
              setPromiseCalls(promiseCalls => [`${Date.now()} ISIN: ${text}`, ...promiseCalls])
              resolve(findItems(text, 'isin', op, matchers))
            },
            options.mockPromiseTime ?? 1,
          )
        })
      isinDef.matchOnPaste = async (text) =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve(findItem(text, 'isin'))
          }, 5)
        })
    }
    const currency = tmpConfg.find(c => c.name === 'Currency')
    if (currency) {
      const currencyDef: DataSourceLookup = currency.definitions[0] as DataSourceLookup
      currencyDef.source = async (text, op, matchers) =>
        new Promise((resolve) => {
          setTimeout(
            () => {
              setPromiseCalls(promiseCalls => [`${Date.now()} Currency: ${text}`, ...promiseCalls])
              resolve(findItems(text, 'currency', op, matchers))
            },
            options.mockPromiseTime ?? 1,
          )
        })
      currencyDef.matchOnPaste = async (text) =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve(findItem(text, 'currency'))
          }, 5)
        })
    }
    const issuer = tmpConfg.find(c => c.name === 'Issuer')
    if (issuer) {
      const issuerDef: DataSourceLookup = issuer.definitions[1] as DataSourceLookup
      issuerDef.source = async (text, op, matchers) =>
        new Promise((resolve) => {
          setTimeout(
            () => {
              setPromiseCalls(promiseCalls => [`${Date.now()} Issuer: ${text}`, ...promiseCalls])
              resolve(findItems(text, 'issuer', op, matchers))
            },
            options.mockPromiseTime ?? 1,
          )
        })
      issuerDef.matchOnPaste = async (text) =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve(findItem(text, 'issuer'))
          }, 5)
        })
    }

    const coupon = tmpConfg.find(c => c.name === 'Coupon')
    if (coupon) {
      const couponDef: DataSourceValue = coupon.definitions[0] as DataSourceValue
      couponDef.match = (text: string) => !isNaN(Number(text))
      couponDef.value = (text: string) => Number.parseFloat(text)
    }
    const size = tmpConfg.find(c => c.name === 'Size')
    if (size) {
      const sizeDef: DataSourceValue = size.definitions[0] as DataSourceValue
      sizeDef.match = (text: string) => !isNaN(Number(text))
      sizeDef.value = (text: string) => Number.parseInt(text)
    }
    const hc = tmpConfg.find(c => c.name === 'HairCut')
    if (hc) {
      const hcDef: DataSourceValue = hc.definitions[0] as DataSourceValue
      hcDef.match = (text: string) => !isNaN(Number(text))
      hcDef.value = (text: string) => Number.parseFloat(text)
    }
    const md = tmpConfg.find(c => c.name === 'MaturityDate')
    if (md) {
      const mdDef: DataSourceValue = md.definitions[0] as DataSourceValue
      mdDef.match = (text: string) => !isNaN(Number(text))
      mdDef.value = (text: string) => Number.parseFloat(text)
    }
    const id = tmpConfg.find(c => c.name === 'IssueDate')
    if (id) {
      const idDef: DataSourceValue = id.definitions[0] as DataSourceValue
      idDef.match = (text: string) => !isNaN(Number(text))
      idDef.value = (text: string) => Number.parseFloat(text)
    }
    setDataSource(tmpConfg)
  }

  React.useEffect(() => {
    configChanged(null)
  }, [configChanged, findItems, findItem, options])

  return (
    <div>
      <div className="mainMultiselectContainer">
        <div className="mainMultiselect">
          <ReactFacetedSearch
            dataSources={dataSource}
            {...options}
            comparisonDescriptons={[
              { symbol: '=', description: 'Equals' },
              { symbol: '!', description: 'Not equals' },
              { symbol: '>', description: 'Greater' },
              { symbol: '<', description: 'Less' },
              { symbol: '>=', description: 'Greater equals' },
              { symbol: '<=', description: 'Less equals' },
              { symbol: '*', description: 'Like' },
              { symbol: '!*', description: 'Not Like' },
              { symbol: '>*', description: 'Starts With' },
              { symbol: '<*', description: 'Ends With' },
            ]}
            styles={{
              reactFacetedSearch: {
                border: 'unset',
                borderBottom: '1px solid lightgray',
              }
            }}
          />
        </div>
        <div className='promiseConfig'>
          <button onClick={() => setShowConfig(true)}><GrConfigure /></button>
          {
            showConfig && <EditConfig config={dataSource} onConfigChanged={configChanged} />
          }
        </div>
        <div className='promiseList'>
          {
            promiseCalls.map(p => <div key={p}>{p}</div>)
          }
        </div>
      </div>

    </div>
  )
}

export default PromiseExample

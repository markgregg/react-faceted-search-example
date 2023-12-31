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
import { AgGridReact } from 'ag-grid-react'
import { bonds } from '../../data/bonds'
import Bond from '../../types/Bond'
import { ColDef, IRowNode } from 'ag-grid-community'
import { createFilter } from '../../types/AgFilter'
import './AgGridExample.css'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { ReactFacetedSearchOptions } from '../../types/ReactFacetedSearchOptions'
import { GrConfigure } from "react-icons/gr";
import EditConfig from '../EditConfig'

interface AgGridExampleProps {
  options: ReactFacetedSearchOptions
}

const formatDate = (date: Date): string =>
  date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear()

const extractDate = (text: string) => {
  const dt = new Date()
  const value = parseInt(text.substring(0, text.length - 1))
  const postFix = text.substring(text.length - 1)
  if (postFix === 'y' || postFix === 'Y') {
    dt.setFullYear(dt.getFullYear() + value)
    return formatDate(dt)
  } else {
    const addYears = (value + dt.getMonth()) / 12
    const months = (value + dt.getMonth()) % 12
    dt.setFullYear(dt.getFullYear() + addYears)
    dt.setMonth(months)
    return formatDate(dt)
  }
}

const AgGridExample: React.FC<AgGridExampleProps> = ({ options }) => {
  const agGridRef = React.useRef<AgGridReact<Bond> | null>(null)
  const [showConfig, setShowConfig] = React.useState<boolean>(false)
  const [matchers, setMatchers] = React.useState<Matcher[]>()
  const [rowData] = React.useState<Bond[]>(bonds)
  const [columnDefs] = React.useState<ColDef<Bond>[]>([
    {
      field: 'isin',
      filter: 'agSetColumnFilter',
      sortable: true,
      resizable: true,
    },
    {
      field: 'currency',
      filter: 'agSetColumnFilter',
      sortable: true,
      resizable: true,
    },
    {
      field: 'issueDate',
      filter: 'agDateColumnFilter',
      sortable: true,
      resizable: true,
    },
    {
      field: 'maturityDate',
      filter: 'agDateColumnFilter',
      sortable: true,
      resizable: true,
    },
    {
      field: 'coupon',
      filter: 'agNumberColumnFilter',
      sortable: true,
      resizable: true,
    },
    {
      field: 'issuer',
      filter: 'agTextColumnFilter',
      sortable: true,
      resizable: true,
    },
    {
      field: 'hairCut',
      filter: 'agNumberColumnFilter',
      sortable: true,
      resizable: true,
    },
  ])
  const [filterSources, setFilterSources] = React.useState<string[]>([])

  const findItems = React.useCallback(
    (
      text: string,
      field: 'isin' | 'currency' | 'issuer',
      isOr: boolean,
    ): SourceItem[] => {
      const uniqueItems = new Set<string>()
      const callback = (row: IRowNode<Bond>) => {
        if (row.data) {
          const value = row.data[field]
          if (value && value.toUpperCase().includes(text.toUpperCase())) {
            uniqueItems.add(value)
          }
        }
      }
      if (isOr) {
        agGridRef.current?.api?.forEachNode(callback)
      } else {
        agGridRef.current?.api?.forEachNodeAfterFilter(callback)
      }
      let items = [...uniqueItems].sort()
      if (items.length > 10) {
        items = items?.slice(10)
      }
      return items
    },
    [],
  )
  const findItem = React.useCallback(
    (text: string, field: 'isin' | 'currency' | 'issuer'): SourceItem[] => {
      let found: any | null = null
      const callback = (row: IRowNode<Bond>) => {
        if (row.data) {
          const value = row.data[field]
          if (value && value === text) {
            found = value
          }
        }
      }
      agGridRef.current?.api?.forEachNode(callback)
      return found
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
          ignoreCase: true,
          searchStartLength: 1,
          source: async (text, op) =>
            new Promise((resolve) => {
              setTimeout(
                () => resolve(findItems(text, 'isin', op === 'or')),
                5,
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
          source: async (text, op) =>
            new Promise((resolve) => {
              setTimeout(
                () => resolve(findItems(text, 'currency', op === 'or')),
                5,
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
      name: 'Size',
      title: 'Size',
      comparisons: numberComparisons,
      precedence: 1,
      selectionLimit: 2,
      definitions: [
        {
          match: (text: string) => !isNaN(Number(text)),
          value: (text: string) => Number.parseInt(text),
          matchOnPaste: true,
        },
      ],
    },
    {
      name: 'Side',
      title: 'Side',
      comparisons: stringComparisons,
      precedence: 4,
      selectionLimit: 2,
      definitions: [
        {
          ignoreCase: true,
          searchStartLength: 2,
          source: ['BUY', 'SELL'],
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
          matchOnPaste: false,
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
        },
        {
          searchStartLength: 3,
          ignoreCase: false,
          source: async (text, op) =>
            new Promise((resolve) => {
              setTimeout(
                () => resolve(findItems(text, 'issuer', op === 'or')),
                5,
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
    }
  ])

  React.useEffect(() => {
    configChanged(null)
  }, [findItems, findItem])


  const getColumn = (source: string): string => {
    switch (source) {
      case 'MaturityDate':
        return 'maturityDate'
      case 'IssueDate':
        return 'issueDate'
      case 'HairCut':
        return 'hairCut'
    }
    return source.toLowerCase()
  }

  const matchersChanged = (newMatchers: Matcher[]) => {
    const sources = newMatchers.filter((m) => !m.changing).map((m) => m.source)
    sources.forEach((source) => {
      const column = getColumn(source)
      const values = newMatchers.filter(
        (m) => m.source === source && !m.changing,
      )
      const filter = createFilter(values)
      const instance = agGridRef.current?.api?.getFilterInstance(column)
      if (instance) {
        instance?.setModel(filter)
      }
    })
    filterSources
      .filter((source) => !sources.includes(source))
      .forEach((source) => {
        const instance = agGridRef.current?.api?.getFilterInstance(
          getColumn(source),
        )
        if (instance) {
          instance?.setModel(null)
        }
      })
    agGridRef.current?.api?.onFilterChanged()
    setFilterSources(sources)
    setMatchers(newMatchers)
  }

  const configChanged = (config: DataSource[] | null) => {
    setShowConfig(false)
    const tmpConfg = config ?? dataSource
    const isin = tmpConfg.find(c => c.name === 'ISIN')
    if (isin) {
      const isinDef: DataSourceLookup = isin.definitions[0] as DataSourceLookup
      isinDef.source = async (text, op) =>
        new Promise((resolve) => {
          setTimeout(
            () => resolve(findItems(text, 'isin', op === 'or')),
            5,
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
      currencyDef.source = async (text, op) =>
        new Promise((resolve) => {
          setTimeout(
            () => resolve(findItems(text, 'currency', op === 'or')),
            5,
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
      issuerDef.source = async (text, op) =>
        new Promise((resolve) => {
          setTimeout(
            () => resolve(findItems(text, 'issuer', op === 'or')),
            5,
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

  return (
    <div>
      <div className="mainMultiselect">
        <ReactFacetedSearch
          matchers={matchers}
          dataSources={dataSource}
          onMatchersChanged={matchersChanged}
          {...options}
          operators="AgGrid"
          styles={{
            reactFacetedSearch: {
              border: 'unset',
              borderBottom: '1px solid lightgray',
            }
          }}
        />
      </div>
      <div className="ag-theme-alpine agGrid">
        <button onClick={() => setShowConfig(true)}><GrConfigure /></button>
        {
          showConfig && <EditConfig config={dataSource} onConfigChanged={configChanged} />
        }
        <AgGridReact
          ref={agGridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          enableAdvancedFilter={true}
        ></AgGridReact>
      </div>
    </div>
  )
}

export default AgGridExample

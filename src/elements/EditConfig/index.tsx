import { DataSource } from 'react-faceted-power-search'
import React from "react"
import './EditConfig.css'
import Select from '../Select'

export interface EditConfigProps {
  config: DataSource[]
  onConfigChanged: (config: DataSource[]) => void
}

const EditConfig: React.FC<EditConfigProps> = ({
  config,
  onConfigChanged,
}) => {
  const [configuration, setConfiguration] = React.useState<DataSource[]>(config)
  const datasources = config.map(d => d.name)
  const [dataSource, setDataSource] = React.useState<string>(datasources[0])
  const [dsConfig, setDsConfg] = React.useState<string>('')
  const [dirty, setDirty] = React.useState<boolean>(false)

  React.useEffect(() => {
    selectDataSource(datasources[0])
  }, [])

  const selectDataSource = (ds: string) => {
    setDataSource(ds)
    setDirty(false)
    const conf = configuration.find(c => c.name === ds)
    if (conf) {
      const tmpConf = {
        ...conf
      }
      if ('source' in tmpConf && typeof tmpConf.source === 'function') {
        delete tmpConf.source
      }
      if ('matchOnPaste' in tmpConf && typeof tmpConf.matchOnPaste === 'function') {
        delete tmpConf.matchOnPaste
      }
      if ('match' in tmpConf && typeof tmpConf.match === 'function') {
        delete tmpConf.match
      }
      if ('value' in tmpConf && typeof tmpConf.value === 'function') {
        delete tmpConf.value
      }
      setDsConfg(JSON.stringify(tmpConf))
    }
  }

  const updateDsConfg = (config: string) => {
    setDsConfg(config)
    setDirty(true)
  }

  const updateDataSource = () => {
    const conf = configuration.find(c => c.name === dataSource)
    if (conf) {
      const updatedConfg = JSON.parse(dsConfig)
      const newConf = {
        ...updatedConfg,
        ...('source' in conf && typeof conf.source === 'function' ? { source: conf.source } : {}),
        ...('matchOnPaste' in conf && typeof conf.matchOnPaste === 'function' ? { source: conf.matchOnPaste } : {}),
        ...('match' in conf && typeof conf.match === 'function' ? { source: conf.match } : {}),
        ...('value' in conf && typeof conf.value === 'function' ? { source: conf.value } : {})
      }
      setConfiguration([
        ...configuration.map(c => {
          return c.name !== dataSource
            ? c
            : newConf
        })
      ])
    }
    setDirty(false)
  }

  return (
    <div className="configMain">
      <div className='configSelectDs'>
        DataSource <Select options={datasources} selection={dataSource} onSelectOption={selectDataSource} />
      </div>
      <textarea className='configText' value={dsConfig} onChange={e => updateDsConfg(e.target.value)} />
      <button className='configUpdate' onClick={() => updateDataSource()} disabled={!dirty}>Update</button>
      <button onClick={() => onConfigChanged(configuration)}>done</button>
    </div>
  )
}

export default EditConfig


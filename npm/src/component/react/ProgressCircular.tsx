import React from "react"
import ReactDOM from "react-dom";
import { MDCCircularProgress } from '@material/circular-progress';

interface Props {
    loading: boolean
}

export class ProgressCircular extends React.Component<Props, any> {
    progressCircular: MDCCircularProgress

    init(e: Element) {
        if (e == null) return
        if (this.progressCircular == null) {
            this.progressCircular = new MDCCircularProgress(e)
            this.progressCircular.determinate = false
        }
        this.showLoading(this.props.loading)
    }

    componentDidMount() {
        const rootE = ReactDOM.findDOMNode(this) as Element
        this.init(rootE)
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<any>, snapshot?: any) {
        this.showLoading(this.props.loading)
    }

    private showLoading(show: boolean) {
        if (show) {
            this.progressCircular.open()
        } else {
            this.progressCircular.close()
        }
    }

    render() {
        return (
            <div className="mdc-circular-progress" style={{ width: "48px", height: "48px" }} role="progressbar" aria-valuemin={0} aria-valuemax={1}>
                <div className="mdc-circular-progress__determinate-container">
                    <svg className="mdc-circular-progress__determinate-circle-graphic" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                        <circle className="mdc-circular-progress__determinate-track" cx="24" cy="24" r="18" stroke-width="4" />
                        <circle className="mdc-circular-progress__determinate-circle" cx="24" cy="24" r="18" stroke-dasharray="113.097" stroke-dashoffset="113.097" stroke-width="4" />
                    </svg>
                </div>
                <div className="mdc-circular-progress__indeterminate-container">
                    <div className="mdc-circular-progress__spinner-layer">
                        <div className="mdc-circular-progress__circle-clipper mdc-circular-progress__circle-left">
                            <svg className="mdc-circular-progress__indeterminate-circle-graphic" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="24" cy="24" r="18" stroke-dasharray="113.097" stroke-dashoffset="56.549" stroke-width="4" />
                            </svg>
                        </div>
                        <div className="mdc-circular-progress__gap-patch">
                            <svg className="mdc-circular-progress__indeterminate-circle-graphic" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="24" cy="24" r="18" stroke-dasharray="113.097" stroke-dashoffset="56.549" stroke-width="3.2" />
                            </svg>
                        </div>
                        <div className="mdc-circular-progress__circle-clipper mdc-circular-progress__circle-right">
                            <svg className="mdc-circular-progress__indeterminate-circle-graphic" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="24" cy="24" r="18" stroke-dasharray="113.097" stroke-dashoffset="56.549" stroke-width="4" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
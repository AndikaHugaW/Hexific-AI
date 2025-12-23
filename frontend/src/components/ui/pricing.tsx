'use client';
import React from 'react';
import { CheckCircleIcon, StarIcon } from 'lucide-react';
import Link from 'next/link';

type FREQUENCY = 'monthly' | 'yearly';

interface Plan {
	name: string;
	info: string;
	price: {
		monthly: number;
		yearly: number;
	};
	features: {
		text: string;
		tooltip?: string;
	}[];
	btn: {
		text: string;
		href: string;
	};
	highlighted?: boolean;
}

interface PricingSectionProps {
	plans: Plan[];
	heading: string;
	description?: string;
}

export function PricingSection({
	plans,
	heading,
	description,
}: PricingSectionProps) {
	const [frequency, setFrequency] = React.useState<FREQUENCY>('monthly');

	return (
		<div style={{
			display: 'flex',
			width: '100%',
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
			padding: '4rem 1rem',
			backgroundColor: '#000',
		}}>
			<div style={{
				maxWidth: '48rem',
				marginBottom: '2rem',
				textAlign: 'center',
			}}>
				<h2 style={{
					fontSize: '2.5rem',
					fontWeight: 'bold',
					color: '#fff',
					marginBottom: '1rem',
				}}>
					{heading}
				</h2>
				{description && (
					<p style={{
						color: '#9ca3af',
						fontSize: '1rem',
					}}>
						{description}
					</p>
				)}
			</div>

			{/* Toggle */}
			<div style={{
				display: 'flex',
				backgroundColor: '#171717',
				border: '1px solid rgba(16, 185, 129, 0.3)',
				borderRadius: '9999px',
				padding: '0.25rem',
				marginBottom: '3rem',
			}}>
				<button
					onClick={() => setFrequency('monthly')}
					style={{
						position: 'relative',
						padding: '0.5rem 1.5rem',
						fontSize: '0.875rem',
						textTransform: 'capitalize',
						color: frequency === 'monthly' ? '#000' : '#d1d5db',
						backgroundColor: frequency === 'monthly' ? '#10b981' : 'transparent',
						borderRadius: '9999px',
						border: 'none',
						cursor: 'pointer',
						fontWeight: 500,
						transition: 'all 0.3s',
					}}
				>
					Bulanan
				</button>
				<button
					onClick={() => setFrequency('yearly')}
					style={{
						position: 'relative',
						padding: '0.5rem 1.5rem',
						fontSize: '0.875rem',
						textTransform: 'capitalize',
						color: frequency === 'yearly' ? '#000' : '#d1d5db',
						backgroundColor: frequency === 'yearly' ? '#10b981' : 'transparent',
						borderRadius: '9999px',
						border: 'none',
						cursor: 'pointer',
						fontWeight: 500,
						transition: 'all 0.3s',
					}}
				>
					Tahunan
				</button>
			</div>

			{/* Cards Grid */}
			<div style={{
				display: 'grid',
				gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
				gap: '1.5rem',
				maxWidth: '1280px',
				width: '100%',
				padding: '0 1rem',
			}}>
				{plans.map((plan) => (
					<div
						key={plan.name}
						style={{
							position: 'relative',
							display: 'flex',
							flexDirection: 'column',
							borderRadius: '0.5rem',
							border: plan.highlighted ? '2px solid rgba(16, 185, 129, 0.5)' : '1px solid #262626',
							backgroundColor: plan.highlighted ? '#0a0a0a' : 'rgba(23, 23, 23, 0.5)',
							boxShadow: plan.highlighted ? '0 0 40px rgba(16, 185, 129, 0.1)' : 'none',
						}}
					>
						{/* Header */}
						<div style={{
							backgroundColor: plan.highlighted ? 'rgba(5, 46, 22, 0.2)' : 'rgba(23, 23, 23, 0.2)',
							borderBottom: '1px solid #262626',
							borderTopLeftRadius: '0.5rem',
							borderTopRightRadius: '0.5rem',
							padding: '1rem',
							position: 'relative',
						}}>
							{plan.highlighted && (
								<div style={{
									position: 'absolute',
									top: '0.5rem',
									right: '0.5rem',
									display: 'flex',
									alignItems: 'center',
									gap: '0.25rem',
									backgroundColor: '#10b981',
									color: '#000',
									padding: '0.25rem 0.5rem',
									borderRadius: '0.375rem',
									fontSize: '0.75rem',
									fontWeight: 'bold',
								}}>
									<StarIcon style={{ width: '0.75rem', height: '0.75rem', fill: 'currentColor' }} />
									Populer
								</div>
							)}

							<div style={{ fontSize: '1.125rem', fontWeight: 500, color: '#fff', marginBottom: '0.5rem' }}>
								{plan.name}
							</div>
							<p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '1rem' }}>
								{plan.info}
							</p>
							<h3 style={{ display: 'flex', alignItems: 'flex-end', gap: '0.25rem' }}>
								<span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>
									${plan.price[frequency]}
								</span>
								<span style={{ color: '#9ca3af' }}>
									{plan.price[frequency] > 0 ? `/${frequency === 'monthly' ? 'bulan' : 'tahun'}` : ''}
								</span>
							</h3>
						</div>

						{/* Features */}
						<div style={{
							padding: '1.5rem 1rem',
							backgroundColor: plan.highlighted ? 'rgba(5, 46, 22, 0.1)' : 'transparent',
							flex: 1,
						}}>
							{plan.features.map((feature, index) => (
								<div key={index} style={{
									display: 'flex',
									alignItems: 'center',
									gap: '0.5rem',
									marginBottom: '1rem',
								}}>
									<CheckCircleIcon style={{ width: '1rem', height: '1rem', color: '#10b981', flexShrink: 0 }} />
									<p style={{ fontSize: '0.875rem', color: '#d1d5db' }}>
										{feature.text}
									</p>
								</div>
							))}
						</div>

						{/* Button */}
						<div style={{
							borderTop: '1px solid #262626',
							padding: '0.75rem',
							backgroundColor: plan.highlighted ? 'rgba(5, 46, 22, 0.2)' : 'transparent',
						}}>
							<Link
								href={plan.btn.href}
								style={{
									display: 'block',
									width: '100%',
									padding: '0.75rem 1rem',
									borderRadius: '0.375rem',
									textAlign: 'center',
									fontWeight: 600,
									textDecoration: 'none',
									backgroundColor: plan.highlighted ? '#10b981' : 'transparent',
									color: plan.highlighted ? '#000' : '#fff',
									border: plan.highlighted ? 'none' : '1px solid #404040',
									transition: 'all 0.3s',
								}}
							>
								{plan.btn.text}
							</Link>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

// Data untuk Hexific AI
export const HEXIFIC_PLANS: Plan[] = [
	{
		name: 'Free Tier',
		info: 'Sempurna untuk developer individu',
		price: {
			monthly: 0,
			yearly: 0,
		},
		features: [
			{ text: '3 audit per hari' },
			{ text: 'Analisis keamanan dasar' },
			{ text: 'Akses AI Assistant' },
			{ text: 'Deteksi kerentanan umum' },
			{ text: 'Community support' },
		],
		btn: {
			text: 'Mulai Gratis',
			href: '#',
		},
	},
	{
		highlighted: true,
		name: 'Professional',
		info: 'Ideal untuk tim pengembangan',
		price: {
			monthly: 49,
			yearly: 490,
		},
		features: [
			{ text: 'Unlimited audit' },
			{ text: 'Analisis mendalam AI' },
			{ text: 'Priority support' },
			{ text: 'Custom security rules' },
			{ text: 'Detailed vulnerability reports' },
			{ text: 'API access' },
		],
		btn: {
			text: 'Upgrade Sekarang',
			href: '#',
		},
	},
	{
		name: 'Enterprise',
		info: 'Untuk organisasi besar',
		price: {
			monthly: 199,
			yearly: 1990,
		},
		features: [
			{ text: 'Dedicated security team' },
			{ text: 'Custom integration' },
			{ text: 'SLA guarantee' },
			{ text: 'On-premise deployment' },
			{ text: 'Advanced compliance reports' },
			{ text: '24/7 premium support' },
		],
		btn: {
			text: 'Hubungi Sales',
			href: '#',
		},
	},
];

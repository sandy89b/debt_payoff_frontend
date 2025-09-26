import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PressButton as Button } from '@/components/ui/PressButton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Crown, Star, BookOpen, Users, Clock, DollarSign } from 'lucide-react';
import { SUBSCRIPTION_PLANS, DIGITAL_PRODUCTS, SERVICE_PAYMENTS } from '@/types/subscription';
import { useAuth } from '@/contexts/AuthContext';

export const UpgradePage: React.FC = () => {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string>('premium');
  const [isYearly, setIsYearly] = useState(false);

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleUpgrade = (planId: string) => {
    // TODO: Implement payment processing
    console.log(`Upgrading to ${planId} plan`);
  };

  const handlePurchaseProduct = (productId: string) => {
    // TODO: Implement product purchase
    console.log(`Purchasing product ${productId}`);
  };

  const handleBookService = (serviceId: string) => {
    // TODO: Implement service booking
    console.log(`Booking service ${serviceId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upgrade your plan</h1>
          <p className="text-lg text-gray-600">Choose the perfect plan for your financial journey</p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4 bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                !isYearly ? 'bg-purple-600 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isYearly ? 'bg-purple-600 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <Badge className="ml-2 bg-green-100 text-green-800">Save 20%</Badge>
            </button>
          </div>
        </div>

        <Tabs defaultValue="subscriptions" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="subscriptions">Subscription Plans</TabsTrigger>
            <TabsTrigger value="products">Digital Products</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
          </TabsList>

          {/* Subscription Plans */}
          <TabsContent value="subscriptions">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {SUBSCRIPTION_PLANS.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`relative transition-all duration-200 hover:shadow-lg ${
                    plan.isPopular ? 'ring-2 ring-purple-500 shadow-lg' : ''
                  } ${selectedPlan === plan.id ? 'ring-2 ring-purple-500' : ''}`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-purple-600 text-white px-3 py-1">
                        <Star className="h-3 w-3 mr-1" />
                        POPULAR
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <div className="text-3xl font-bold text-gray-900">
                      ${isYearly && plan.price > 0 ? (plan.price * 12 * 0.8).toFixed(2) : plan.price}
                      <span className="text-lg font-normal text-gray-600">
                        {plan.price === 0 ? '' : ` USD / ${isYearly ? 'year' : 'month'}`}
                      </span>
                    </div>
                    <CardDescription className="text-gray-600">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={`w-full ${
                        plan.isCurrent ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                      }`}
                      variant={plan.buttonVariant as any}
                      disabled={plan.isCurrent}
                      onClick={() => handleUpgrade(plan.id)}
                    >
                      {plan.isCurrent ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          {plan.buttonText}
                        </>
                      ) : (
                        <>
                          <Crown className="h-4 w-4 mr-2" />
                          {plan.buttonText}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Digital Products */}
          <TabsContent value="products">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {DIGITAL_PRODUCTS.map((product) => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{product.name}</CardTitle>
                      <Badge variant="outline" className="text-purple-600 border-purple-600">
                        {product.category}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      ${product.price}
                    </div>
                    <CardDescription>{product.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {product.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button 
                      className="w-full" 
                      onClick={() => handlePurchaseProduct(product.id)}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Purchase Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Services */}
          <TabsContent value="services">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {SERVICE_PAYMENTS.map((service) => (
                <Card key={service.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl">{service.name}</CardTitle>
                    <div className="text-2xl font-bold text-gray-900">
                      ${service.price}
                    </div>
                    <CardDescription>{service.description}</CardDescription>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-1" />
                      {service.duration}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {service.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button 
                      className="w-full" 
                      onClick={() => handleBookService(service.id)}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Book Service
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-gray-600">
          <p>Have an existing plan? <a href="#" className="text-purple-600 hover:underline">See billing help</a></p>
        </div>
      </div>
    </div>
  );
};
